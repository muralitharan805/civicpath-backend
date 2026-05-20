import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssemblyConstituencyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the total count of assembly constituencies.
   */
  async count(): Promise<number> {
    return this.prisma.assembly_constituencies.count();
  }

  /**
   * Retrieves a paginated list of assembly constituencies.
   * Note: The 'geom' column is unsupported by standard Prisma queries and is automatically omitted.
   */
  async findMany(limit: number = 10): Promise<any[]> {
    return this.prisma.assembly_constituencies.findMany({
      take: limit,
      orderBy: {
        ogc_fid: 'asc',
      },
    });
  }

  /**
   * Performs a spatial query using Prisma raw SQL to find constituencies near a specific coordinate.
   * Demonstrates how to handle the Unsupported PostGIS geometry field safely.
   */
  async findNearCoordinate(
    longitude: number,
    latitude: number,
    limit: number = 5,
  ): Promise<any[]> {
    // ST_SetSRID(ST_MakePoint(lon, lat), 4326) creates a PostGIS point
    // We order by distance using the <-> operator
    return this.prisma.$queryRaw<any[]>`
      SELECT 
        ogc_fid, 
        st_name, 
        dist_name, 
        ac_name, 
        pc_name,
        ST_AsText(geom) as geom_wkt,
        ST_Distance(
          geom, 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) as distance_meters
      FROM assembly_constituencies
      ORDER BY geom <-> ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      LIMIT ${limit};
    `;
  }
}
