import { GOOGLE_API_KEY } from '../config';
import * as distance from 'google-distance-matrix';

distance.key(GOOGLE_API_KEY);

export default distance;
