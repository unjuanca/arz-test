import {
  Injectable,
} from '@nestjs/common';

import { GOOGLE_API_KEY } from '../config';
import * as distance from 'google-distance-matrix';

distance.key(GOOGLE_API_KEY);

@Injectable()
export class GoogleMapsService {

  async getMatrix(origin: object, destinations: object): Promise<any> {
    const distances = await new Promise((resolve, reject) => {
      distance.matrix(origin, destinations, (err, distances) => {
        if (!err)
          resolve(distances);
      });
    });
    return distances;
  }

}
