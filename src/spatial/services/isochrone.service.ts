import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface IsochroneResult {
  type: 'Feature';
  geometry: Record<string, unknown>;
  properties: {
    longitude: number;
    latitude: number;
    driveTimeMinutes: number;
    radiusMeters: number;
    mode: string;
    areaKm2: number;
  };
}

@Injectable()
export class IsochroneService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a spatial polygon and catchment metadata for a given lat/lon and drive time/radius.
   * Leverages PostGIS ST_Buffer, ST_AsGeoJSON, and geography casting for precise metric calculation.
   */
  async generateIsochrone(
    longitude: number,
    latitude: number,
    driveTimeMinutes: number = 10,
    mode: string = 'driving',
  ): Promise<IsochroneResult> {
    // 1 min driving approx ~ 500m in urban area, 1 min walking ~ 80m
    const speedFactorMetersPerMin = mode === 'walking' ? 80 : 500;
    const radiusMeters = driveTimeMinutes * speedFactorMetersPerMin;

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        ST_AsGeoJSON(
          ST_Buffer(
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, 
            ${radiusMeters}
          )::geometry
        ) as geojson,
        (
          ST_Area(
            ST_Buffer(
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, 
              ${radiusMeters}
            )
          ) / 1000000.0
        ) as area_sq_km;
    `;

    const geojson = result[0]?.geojson ? JSON.parse(result[0].geojson) : null;
    const areaKm2 = result[0]?.area_sq_km ? parseFloat(result[0].area_sq_km) : 0;

    return {
      type: 'Feature',
      geometry: geojson,
      properties: {
        longitude,
        latitude,
        driveTimeMinutes,
        radiusMeters,
        mode,
        areaKm2: Math.round(areaKm2 * 100) / 100,
      },
    };
  }
}
