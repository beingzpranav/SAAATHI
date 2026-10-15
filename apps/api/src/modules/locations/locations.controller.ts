import type { Request, Response } from 'express';
import type { ApiResponse, LocationState, LocationDistrict, LocationBlock } from '@saathi/shared';
import { STATES_DATA, DISTRICTS_DATA, BLOCKS_DATA } from './locations.data.js';
import { HTTP_STATUS } from '../../config/constants.js';

class LocationsController {
  getStates = (req: Request, res: Response<ApiResponse<LocationState[]>>) => {
    const requestId = req.headers['x-request-id'] as string;
    res.status(HTTP_STATUS.OK).json({
      data: STATES_DATA,
      meta: { requestId, timestamp: new Date().toISOString() },
    });
  };

  getDistricts = (req: Request, res: Response<ApiResponse<LocationDistrict[]>>) => {
    const requestId = req.headers['x-request-id'] as string;
    const { state } = req.query;

    let filtered = DISTRICTS_DATA;
    if (typeof state === 'string' && state.trim()) {
      const stateObj = STATES_DATA.find(
        (s) =>
          s.name.toLowerCase() === state.trim().toLowerCase() ||
          s.code.toLowerCase() === state.trim().toLowerCase(),
      );
      if (stateObj) {
        filtered = DISTRICTS_DATA.filter((d) => d.stateCode === stateObj.code);
      }
    }

    res.status(HTTP_STATUS.OK).json({
      data: filtered,
      meta: { requestId, timestamp: new Date().toISOString() },
    });
  };

  getBlocks = (req: Request, res: Response<ApiResponse<LocationBlock[]>>) => {
    const requestId = req.headers['x-request-id'] as string;
    const { district } = req.query;

    let filtered = BLOCKS_DATA;
    if (typeof district === 'string' && district.trim()) {
      const distObj = DISTRICTS_DATA.find(
        (d) =>
          d.name.toLowerCase() === district.trim().toLowerCase() ||
          d.code.toLowerCase() === district.trim().toLowerCase(),
      );
      if (distObj) {
        filtered = BLOCKS_DATA.filter((b) => b.districtCode === distObj.code);
      }
    }

    res.status(HTTP_STATUS.OK).json({
      data: filtered,
      meta: { requestId, timestamp: new Date().toISOString() },
    });
  };
}

export const locationsController = new LocationsController();
