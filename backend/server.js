import app from './src/app.js';
import sequelize from './src/config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test DB connection
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');

        // DO NOT use sequelize.sync() — hum existing DB use kar rahe hain
        // await sequelize.sync({ alter: false });

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to connect to database:', error);
        process.exit(1);
    }
};

startServer();