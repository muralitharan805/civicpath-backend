import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AssemblyConstituency {
  ogc_fid: number;
  st_name: string | null;
  dist_name: string | null;
  ac_no: number | string | null;
  ac_name: string | null;
  pc_name: string | null;
  geom_wkt: string | null;
}

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

  /**
   * Finds the single assembly constituency that contains the given coordinate.
   * Returns null if no constituency contains the coordinates.
   */
  async findByCoordinates(
    longitude: number,
    latitude: number,
  ): Promise<AssemblyConstituency | null> {
    const result = await this.prisma.$queryRaw<AssemblyConstituency[]>`
      SELECT 
        ogc_fid, 
        st_name, 
        dist_name, 
        ac_no, 
        ac_name, 
        pc_name,
        ST_AsText(geom) as geom_wkt
      FROM assembly_constituencies
      WHERE ST_Contains(
        geom, 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )
      LIMIT 1;
    `;
    return result[0] || null;
  }

  /**
   * Finds the single parliament constituency that contains the given coordinate.
   * Returns null if no constituency contains the coordinates.
   */
  async findParliamentByCoordinates(
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
      FROM parliment_constituencies
      WHERE ST_Contains(
        geom, 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )
      LIMIT 1;
    `;
    return result[0] || null;
  }
}

