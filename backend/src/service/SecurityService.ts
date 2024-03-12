import { secureDatabase, SquidService } from '@squidcloud/backend';

/**
 * Here you can define different backend functions that:
 * 1 - Can be called from the frontend
 * 2 - Can secure data access
 * 3 - Can be called as a trigger
 * 4 - Can define a webhook
 * 5 - Can be called as a scheduler
 * 6 - And more
 *
 * Note: This code will be executed in a secure environment and can perform any operation including database access,
 * API calls, etc.
 *
 * For more information and examples see: https://docs.squid.cloud/docs/development-tools/backend/
 */
export class SecurityService extends SquidService {
  // TODO: !!!IMPORTANT!!! - Replace this function with your own granular security rules
  @secureDatabase('all', 'postgres_id')
  allAllAccess(): boolean {
    //console.log('Security service called');
    return true;
  }
}
