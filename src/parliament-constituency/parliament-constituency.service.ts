import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ParliamentConstituency {
  ogc_fid: number;
  st_name: string | null;
  pc_name: string | null;
  st_code: string | null;
  pc_code: number | string | null;
  res: string | null;
  geom_wkt: string | null;
}

@Injectable()
export class ParliamentConstituencyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the total count of parliament constituencies.
   */
  async count(): Promise<number> {
    return this.prisma.parliment_constituencies.count();
  }

  /**
   * Retrieves a paginated list of parliament constituencies.
   * Note: The 'geom' column is unsupported by standard Prisma queries and is automatically omitted.
   */
  async findMany(limit: number = 10): Promise<ParliamentConstituency[]> {
    const results = await this.prisma.parliment_constituencies.findMany({
      take: limit,
      orderBy: {
        ogc_fid: 'asc',
      },
    });

    // Map database results to the ParliamentConstituency type.
    // Explicitly casting geom to null since standard Prisma query automatically omits Unsupported type
    return results.map((item) => ({
      ogc_fid: item.ogc_fid,
      st_name: item.st_name,
      pc_name: item.pc_name,
      st_code: item.st_code,
      pc_code: item.pc_code ? Number(item.pc_code) : null,
      res: item.res,
      geom_wkt: null,
    }));
  }

  /**
   * Performs a spatial query using Prisma raw SQL to find parliament constituencies near a specific coordinate.
   */
  async findNearCoordinate(
    longitude: number,
    latitude: number,
    limit: number = 5,
  ): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT 
        ogc_fid, 
        st_name, 
        pc_name, 
        st_code,
        pc_code,
        res,
        ST_AsText(geom) as geom_wkt,
        ST_Distance(
          geom, 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) as distance_meters
      FROM core.parliment_constituencies
      ORDER BY geom <-> ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      LIMIT ${limit};
    `;
  }

  /**
   * Finds the single parliament constituency that contains the given coordinate.
   * Returns null if no constituency contains the coordinates.
   */
  async findByCoordinates(
    longitude: number,
    latitude: number,
  ): Promise<ParliamentConstituency | null> {
    const result = await this.prisma.$queryRaw<ParliamentConstituency[]>`
      SELECT 
        ogc_fid, 
        st_name, 
        pc_name, 
        st_code, 
        pc_code, 
        res,
        ST_AsText(geom) as geom_wkt
      FROM core.parliment_constituencies
      WHERE ST_Contains(
        geom, 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )
      LIMIT 1;
    `;
    return result[0] || null;
  }
}
