import { Test, TestingModule } from '@nestjs/testing';
import { AssemblyConstituencyController } from './assembly-constituency.controller';
import { AssemblyConstituencyService } from './assembly-constituency.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AssemblyConstituencyController', () => {
  let controller: AssemblyConstituencyController;
  let service: AssemblyConstituencyService;

  const mockAssemblyConstituencyService = {
    count: jest.fn().mockResolvedValue(4182),
    findMany: jest.fn().mockResolvedValue([
      { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit' },
    ]),
    findNearCoordinate: jest.fn().mockResolvedValue([
      { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit', distance_meters: 100 },
    ]),
    findByCoordinates: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssemblyConstituencyController],
      providers: [
        {
          provide: AssemblyConstituencyService,
          useValue: mockAssemblyConstituencyService,
        },
      ],
    }).compile();

    controller = module.get<AssemblyConstituencyController>(AssemblyConstituencyController);
    service = module.get<AssemblyConstituencyService>(AssemblyConstituencyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCount', () => {
    it('should return count object', async () => {
      const result = await controller.getCount();
      expect(result).toEqual({ count: 4182 });
      expect(service.count).toHaveBeenCalled();
    });
  });

  describe('getConstituencies', () => {
    it('should return constituencies list', async () => {
      const result = await controller.getConstituencies(10);
      expect(result).toEqual([
        { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit' },
      ]);
      expect(service.findMany).toHaveBeenCalledWith(10);
    });
  });

  describe('getNearCoordinates', () => {
    it('should return nearest constituencies', async () => {
      const result = await controller.getNearCoordinates('80.0', '13.0', 5);
      expect(result).toEqual([
        { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit', distance_meters: 100 },
      ]);
      expect(service.findNearCoordinate).toHaveBeenCalledWith(80.0, 13.0, 5);
    });

    it('should throw BadRequestException if lon or lat is missing', async () => {
      await expect(
        controller.getNearCoordinates(undefined, '13.0', 5),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if coordinates are invalid numbers', async () => {
      await expect(
        controller.getNearCoordinates('invalid', '13.0', 5),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findInsideBoundary', () => {
    it('should return the containing constituency if found', async () => {
      const mockResult = { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit' };
      jest.spyOn(service, 'findByCoordinates').mockResolvedValueOnce(mockResult);

      const result = await controller.findInsideBoundary({
        latitude: 13.0,
        longitude: 80.0,
      });
      expect(result).toEqual(mockResult);
      expect(service.findByCoordinates).toHaveBeenCalledWith(80.0, 13.0);
    });

    it('should throw NotFoundException if no constituency contains coordinates', async () => {
      jest.spyOn(service, 'findByCoordinates').mockResolvedValueOnce(null);

      await expect(
        controller.findInsideBoundary({
          latitude: 13.0,
          longitude: 80.0,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
