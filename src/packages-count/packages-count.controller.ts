import {
  Controller,
} from '@nestjs/common';
import { PackagesCountService } from './packages-count.service';

import {
  ApiUseTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiUseTags('packages-count')
@Controller('packages-count')
export class PackagesCountController {
  constructor(private readonly packagesCountService: PackagesCountService) {}
}
