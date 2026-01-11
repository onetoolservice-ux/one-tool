/**
 * Environment Variable Validation
 * Validates required environment variables at build/runtime
 */

interface EnvConfig {
  [key: string]: {
    required: boolean;
    description: string;
    validate?: (value: string) => boolean;
    errorMessage?: string;
  };
}

const ENV_CONFIG: EnvConfig = {
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    description: 'Supabase project URL',
    validate: (value) => value.startsWith('https://') && value.includes('.supabase.co'),
    errorMessage: 'Must be a valid Supabase URL (https://*.supabase.co)',
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    description: 'Supabase anonymous key',
    validate: (value) => value.length > 20, // JWT tokens are typically long strings
    errorMessage: 'Must be a valid Supabase anonymous key (minimum 20 characters)',
  },
  NEXT_PUBLIC_ENABLE_ANALYTICS: {
    required: false,
    description: 'Enable Google Analytics (true/false)',
    validate: (value) => value === 'true' || value === 'false',
  },
  NEXT_PUBLIC_GA_ID: {
    required: false,
    description: 'Google Analytics ID (required if analytics enabled)',
    validate: (value) => value.startsWith('G-'),
    errorMessage: 'Must start with G-',
  },
};

/**
 * Validate environment variables
 * Throws error with clear message if validation fails
 */
export function validateEnvVars(): void {
  const missing: string[] = [];
  const invalid: Array<{ key: string; message: string }> = [];

  for (const [key, config] of Object.entries(ENV_CONFIG)) {
    const value = process.env[key];

    if (config.required && !value) {
      missing.push(key);
      continue;
    }

    if (value && config.validate && !config.validate(value)) {
      invalid.push({
        key,
        message: config.errorMessage || `Invalid value for ${key}`,
      });
    }
  }

  // Check conditional requirements
  if (
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' &&
    !process.env.NEXT_PUBLIC_GA_ID
  ) {
    invalid.push({
      key: 'NEXT_PUBLIC_GA_ID',
      message: 'Required when NEXT_PUBLIC_ENABLE_ANALYTICS=true',
    });
  }

  if (missing.length > 0 || invalid.length > 0) {
    let errorMessage = 'Environment variable validation failed:\n\n';

    if (missing.length > 0) {
      errorMessage += 'Missing required variables:\n';
      missing.forEach((key) => {
        errorMessage += `  - ${key}: ${ENV_CONFIG[key].description}\n`;
      });
      errorMessage += '\n';
    }

    if (invalid.length > 0) {
      errorMessage += 'Invalid variables:\n';
      invalid.forEach(({ key, message }) => {
        errorMessage += `  - ${key}: ${message}\n`;
      });
      errorMessage += '\n';
    }

    errorMessage +=
      'Please check your .env.local file and ensure all required variables are set correctly.';

    throw new Error(errorMessage);
  }
}

/**
 * Validate environment variables at module load (for server-side)
 * Only validates in production builds, allows missing vars in development
 */
if (typeof window === 'undefined') {
  try {
    // Only validate in production builds, not during development
    // This allows the build to proceed even if env vars are missing
    // The actual runtime will fail with a clear error message
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      validateEnvVars();
    }
  } catch (error) {
    // In production build, fail fast
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    // In development, just warn
    console.warn('⚠️  Environment variable validation warning:', error);
  }
}
