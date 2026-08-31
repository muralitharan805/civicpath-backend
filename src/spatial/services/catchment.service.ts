import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CatchmentAnalysisResult {
  location: {
    longitude: number;
    latitude: number;
    radiusMeters: number;
  };
  areaKm2: number;
  intersectedDistricts: Array<{ districtName: string; stateName: string }>;
  intersectedAssemblyConstituencies: Array<{ constituencyName: string; districtName: string; stateName: string }>;
  estimatedCatchmentPopulation: number;
  competitorDensityScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable()
export class CatchmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Computes spatial intersections against PostGIS district and constituency boundaries.
   */
  async analyzeCatchment(
    longitude: number,
    latitude: number,
    radiusMeters: number = 3000,
  ): Promise<CatchmentAnalysisResult> {
    const areaKm2 = Math.round((Math.PI * Math.pow(radiusMeters / 1000, 2)) * 100) / 100;

    // 1. Fetch Intersected Districts
    const districts = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT 
        district as "districtName", 
        st_nm as "stateName"
      FROM core.districts
      WHERE ST_Intersects(
        geom,
        ST_Buffer(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, ${radiusMeters})::geometry
      );
    `;

    // 2. Fetch Intersected Assembly Constituencies
    const constituencies = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT 
        ac_name as "constituencyName", 
        dist_name as "districtName", 
        st_name as "stateName"
      FROM core.assembly_constituencies
      WHERE ST_Intersects(
        geom,
        ST_Buffer(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, ${radiusMeters})::geometry
      );
    `;

    // Estimated urban catchment population baseline (~15,000 residents per sq km in urban centres)
    const estimatedCatchmentPopulation = Math.round(areaKm2 * 14800);

    const competitorDensityScore: 'LOW' | 'MEDIUM' | 'HIGH' =
      areaKm2 > 25 ? 'HIGH' : areaKm2 > 10 ? 'MEDIUM' : 'LOW';

    return {
      location: { longitude, latitude, radiusMeters },
      areaKm2,
      intersectedDistricts: districts || [],
      intersectedAssemblyConstituencies: constituencies || [],
      estimatedCatchmentPopulation,
      competitorDensityScore,
    };
  }
}
