import { 
  Injectable, 
  NestInterceptor, 
  ExecutionContext, 
  CallHandler,
  Logger 
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

/**
 * Interceptor for logging lead analysis process
 * Provides comprehensive logging for analysis chart generation
 */
@Injectable()
export class AnalysisLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AnalysisLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { params, query } = request;
    const leadId = params.id;
    const startTime = Date.now();

    this.logger.log(`Starting analysis chart generation for lead ${leadId}`, {
      leadId,
      query,
      timestamp: new Date().toISOString()
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(`Analysis chart generated successfully for lead ${leadId}`, {
          leadId,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(`Failed to generate analysis chart for lead ${leadId}`, {
          leadId,
          duration: `${duration}ms`,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        throw error;
      })
    );
  }
} 
