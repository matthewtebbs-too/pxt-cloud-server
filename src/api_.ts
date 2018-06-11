/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { PublicAPI } from './api';
import { Endpoint } from './endpoint_';

export type PrivateAPI = { [E in keyof PublicAPI]: Endpoint | null };
