import { Test, TestingModule } from '@nestjs/testing';
import { AssemblyConstituencyService } from './assembly-constituency.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AssemblyConstituencyService', () => {
  let service: AssemblyConstituencyService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    assembly_constituencies: {
      count: jest.fn().mockResolvedValue(4182),
      findMany: jest.fn().mockResolvedValue([
        { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit' },
      ]),
    },
    $queryRaw: jest.fn().mockResolvedValue([
      { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit', distance_meters: 100 },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssemblyConstituencyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AssemblyConstituencyService>(AssemblyConstituencyService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('count', () => {
    it('should return the total count of constituencies', async () => {
      const result = await service.count();
      expect(result).toEqual(4182);
      expect(prismaService.assembly_constituencies.count).toHaveBeenCalled();
    });
  });

  describe('findMany', () => {
    it('should return a list of constituencies with the given limit', async () => {
      const result = await service.findMany(5);
      expect(result).toEqual([
        { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit' },
      ]);
      expect(prismaService.assembly_constituencies.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { ogc_fid: 'asc' },
      });
    });
  });

  describe('findNearCoordinate', () => {
    it('should query the database using raw spatial query', async () => {
      const result = await service.findNearCoordinate(80.0, 13.0, 5);
      expect(result).toEqual([
        { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit', distance_meters: 100 },
      ]);
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('findByCoordinates', () => {
    it('should return a containing constituency if found', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValueOnce([
        { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit' },
      ]);
      const result = await service.findByCoordinates(80.0, 13.0);
      expect(result).toEqual({ ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit' });
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should return null if no constituency matches', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValueOnce([]);
      const result = await service.findByCoordinates(80.0, 13.0);
      expect(result).toBeNull();
    });
  });

  describe('findParliamentByCoordinates', () => {
    it('should return a containing parliament constituency if found', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValueOnce([
        { ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA' },
      ]);
      const result = await service.findParliamentByCoordinates(80.0, 13.0);
      expect(result).toEqual({ ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA' });
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should return null if no parliament constituency matches', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValueOnce([]);
      const result = await service.findParliamentByCoordinates(80.0, 13.0);
      expect(result).toBeNull();
    });
  });
});
