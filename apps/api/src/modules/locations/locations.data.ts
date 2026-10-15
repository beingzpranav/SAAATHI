import type { LocationState, LocationDistrict, LocationBlock } from '@saathi/shared';

export const STATES_DATA: LocationState[] = [
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'BR', name: 'Bihar' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'MH', name: 'Maharashtra' },
];

export const DISTRICTS_DATA: LocationDistrict[] = [
  { code: 'UP_VARANASI', name: 'Varanasi', stateCode: 'UP' },
  { code: 'UP_LUCKNOW', name: 'Lucknow', stateCode: 'UP' },
  { code: 'UP_GORAKHPUR', name: 'Gorakhpur', stateCode: 'UP' },
  { code: 'UP_PRAYAGRAJ', name: 'Prayagraj', stateCode: 'UP' },
  { code: 'BR_PATNA', name: 'Patna', stateCode: 'BR' },
  { code: 'BR_GAYA', name: 'Gaya', stateCode: 'BR' },
  { code: 'MP_BHOPAL', name: 'Bhopal', stateCode: 'MP' },
  { code: 'RJ_JAIPUR', name: 'Jaipur', stateCode: 'RJ' },
  { code: 'MH_PUNE', name: 'Pune', stateCode: 'MH' },
];

export const BLOCKS_DATA: LocationBlock[] = [
  { code: 'VAR_PINDRA', name: 'Pindra', districtCode: 'UP_VARANASI' },
  { code: 'VAR_SEVAPURI', name: 'Sevapuri', districtCode: 'UP_VARANASI' },
  { code: 'VAR_KASHI_VIDYAPEETH', name: 'Kashi Vidyapeeth', districtCode: 'UP_VARANASI' },
  { code: 'VAR_HARAHUA', name: 'Harahua', districtCode: 'UP_VARANASI' },
  { code: 'VAR_CHOLAPUR', name: 'Cholapur', districtCode: 'UP_VARANASI' },
  { code: 'VAR_ARAJI_LINE', name: 'Arajiline', districtCode: 'UP_VARANASI' },
  { code: 'VAR_BADAGAON', name: 'Badagaon', districtCode: 'UP_VARANASI' },
  { code: 'VAR_CHIRAIGAON', name: 'Chiraigaon', districtCode: 'UP_VARANASI' },
  // Districts fallback test blocks
  { code: 'LKO_CHINHAT', name: 'Chinhat', districtCode: 'UP_LUCKNOW' },
  { code: 'LKO_BAKSHI', name: 'Bakshi Ka Talab', districtCode: 'UP_LUCKNOW' },
];
