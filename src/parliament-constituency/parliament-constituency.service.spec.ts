import { Test, TestingModule } from '@nestjs/testing';
import { ParliamentConstituencyService, PrismaWithParliament } from './parliament-constituency.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ParliamentConstituencyService', () => {
  let service: ParliamentConstituencyService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    parliment_constituencies: {
      count: jest.fn().mockResolvedValue(543),
      findMany: jest.fn().mockResolvedValue([
        { ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA' },
      ]),
    },
    $queryRaw: jest.fn().mockResolvedValue([
      { ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA', distance_meters: 200 },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParliamentConstituencyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ParliamentConstituencyService>(ParliamentConstituencyService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('count', () => {
    it('should return total count of parliament constituencies', async () => {
      const result = await service.count();
      expect(result).toEqual(543);
      const db = prismaService as unknown as PrismaWithParliament;
      expect(db.parliment_constituencies.count).toHaveBeenCalled();
    });
  });

  describe('findMany', () => {
    it('should return a list of parliament constituencies', async () => {
      const result = await service.findMany(5);
      expect(result).toEqual([
        {
          ogc_fid: 1,
          st_name: 'HIMACHAL PRADESH',
          pc_name: 'KANGRA',
          st_code: undefined,
          pc_code: null,
          res: undefined,
          geom_wkt: null,
        },
      ]);
      const db = prismaService as unknown as PrismaWithParliament;
      expect(db.parliment_constituencies.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { ogc_fid: 'asc' },
      });
    });
  });

  describe('findNearCoordinate', () => {
    it('should perform raw PostGIS queries for nearest coordinates', async () => {
      const result = await service.findNearCoordinate(80.0, 13.0, 5);
      expect(result).toEqual([
        { ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA', distance_meters: 200 },
      ]);
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('findByCoordinates', () => {
    it('should return containing parliament constituency if found', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValueOnce([
        { ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA' },
      ]);
      const result = await service.findByCoordinates(80.0, 13.0);
      expect(result).toEqual({ ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA' });
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should return null if no constituency contains coordinates', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValueOnce([]);
      const result = await service.findByCoordinates(80.0, 13.0);
      expect(result).toBeNull();
    });
  });
});
