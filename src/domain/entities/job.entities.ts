export enum JobStatus {
  pending = 'pending',
  running = 'running',
  succeeded = 'succeeded',
  fail = 'failed',
}
export interface Job {
  jobId: string;       // map từ BigInt -> string
  videoId: string;     // map từ BigInt -> string
  action: string;
  params: Record<string, any>;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobInput {
  videoId: string | number | bigint;
  action: string;
  params?: Record<string, any>;
  status?: JobStatus; // mặc định pending
}

export interface UpdateJobInput {
  action?: string;
  params?: Record<string, any>;
  status?: JobStatus;
}