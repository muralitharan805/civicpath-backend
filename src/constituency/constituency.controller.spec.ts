import { Test, TestingModule } from '@nestjs/testing';
import { ConstituencyController } from './constituency.controller';
import { AssemblyConstituencyService } from '../assembly-constituency/assembly-constituency.service';
import { ParliamentConstituencyService } from '../parliament-constituency/parliament-constituency.service';
import { NotFoundException } from '@nestjs/common';

describe('ConstituencyController', () => {
  let controller: ConstituencyController;
  let assemblyService: AssemblyConstituencyService;
  let parliamentService: ParliamentConstituencyService;

  const mockAssemblyService = {
    findByCoordinates: jest.fn(),
  };

  const mockParliamentService = {
    findByCoordinates: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConstituencyController],
      providers: [
        {
          provide: AssemblyConstituencyService,
          useValue: mockAssemblyService,
        },
        {
          provide: ParliamentConstituencyService,
          useValue: mockParliamentService,
        },
      ],
    }).compile();

    controller = module.get<ConstituencyController>(ConstituencyController);
    assemblyService = module.get<AssemblyConstituencyService>(AssemblyConstituencyService);
    parliamentService = module.get<ParliamentConstituencyService>(ParliamentConstituencyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findInsideBoundary', () => {
    it('should return combined constituencies when found', async () => {
      const mockAssembly = { ogc_fid: 1, st_name: 'NAGALAND', ac_name: 'Tizit' };
      const mockParliament = { ogc_fid: 10, st_name: 'NAGALAND', pc_name: 'Nagaland' };

      mockAssemblyService.findByCoordinates.mockResolvedValueOnce(mockAssembly);
      mockParliamentService.findByCoordinates.mockResolvedValueOnce(mockParliament);

      const result = await controller.findInsideBoundary({
        latitude: 13.0,
        longitude: 80.0,
      });

      expect(result).toEqual({
        assemblyConstituency: mockAssembly,
        parliamentConstituency: mockParliament,
      });
      expect(assemblyService.findByCoordinates).toHaveBeenCalledWith(80.0, 13.0);
      expect(parliamentService.findByCoordinates).toHaveBeenCalledWith(80.0, 13.0);
    });

    it('should throw NotFoundException if neither constituency is found', async () => {
      mockAssemblyService.findByCoordinates.mockResolvedValueOnce(null);
      mockParliamentService.findByCoordinates.mockResolvedValueOnce(null);

      await expect(
        controller.findInsideBoundary({
          latitude: 13.0,
          longitude: 80.0,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
