import { Test, TestingModule } from '@nestjs/testing';
import { ParliamentConstituencyController } from './parliament-constituency.controller';
import { ParliamentConstituencyService } from './parliament-constituency.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ParliamentConstituencyController', () => {
  let controller: ParliamentConstituencyController;
  let service: ParliamentConstituencyService;

  const mockParliamentConstituencyService = {
    count: jest.fn().mockResolvedValue(543),
    findMany: jest.fn().mockResolvedValue([
      { ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA' },
    ]),
    findNearCoordinate: jest.fn().mockResolvedValue([
      { ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA', distance_meters: 200 },
    ]),
    findByCoordinates: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParliamentConstituencyController],
      providers: [
        {
          provide: ParliamentConstituencyService,
          useValue: mockParliamentConstituencyService,
        },
      ],
    }).compile();

    controller = module.get<ParliamentConstituencyController>(ParliamentConstituencyController);
    service = module.get<ParliamentConstituencyService>(ParliamentConstituencyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCount', () => {
    it('should return total count', async () => {
      const result = await controller.getCount();
      expect(result).toEqual({ count: 543 });
      expect(service.count).toHaveBeenCalled();
    });
  });

  describe('getConstituencies', () => {
    it('should return list of constituencies', async () => {
      const result = await controller.getConstituencies(10);
      expect(result).toEqual([
        { ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA' },
      ]);
      expect(service.findMany).toHaveBeenCalledWith(10);
    });
  });

  describe('getNearCoordinates', () => {
    it('should return nearest parliament constituencies', async () => {
      const result = await controller.getNearCoordinates('80.0', '13.0', 5);
      expect(result).toEqual([
        { ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA', distance_meters: 200 },
      ]);
      expect(service.findNearCoordinate).toHaveBeenCalledWith(80.0, 13.0, 5);
    });

    it('should throw BadRequestException if coordinate fields are missing', async () => {
      await expect(
        controller.getNearCoordinates(undefined, '13.0', 5),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if coordinates are not numbers', async () => {
      await expect(
        controller.getNearCoordinates('invalid', '13.0', 5),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findInsideBoundary', () => {
    it('should returncontaining constituency if found', async () => {
      const mockResult = { ogc_fid: 1, st_name: 'HIMACHAL PRADESH', pc_name: 'KANGRA' };
      jest.spyOn(service, 'findByCoordinates').mockResolvedValueOnce(mockResult as any);

      const result = await controller.findInsideBoundary({
        latitude: 13.0,
        longitude: 80.0,
      });
      expect(result).toEqual(mockResult);
      expect(service.findByCoordinates).toHaveBeenCalledWith(80.0, 13.0);
    });

    it('should throw NotFoundException if no constituency contains coordinate', async () => {
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
