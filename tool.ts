#!/usr/bin/env tsx

import path from 'path'
import dotenv from 'dotenv'
import { run } from './main'

dotenv.config({
  path: path.resolve(__dirname, '.env'),
})

run()
