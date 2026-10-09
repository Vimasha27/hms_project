import app from './app';
import { config } from './config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🏥 CareSync HMS Server running on port ${PORT}`);
  console.log(`🚀 Environment: ${config.nodeEnv}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
