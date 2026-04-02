// ============================================
// server.js — Backend para guardar avatares en Azure SQL
// 
// INSTALACIÓN:
//   npm init -y
//   npm install express mssql cors
//
// EJECUCIÓN:
//   node server.js
//
// El servidor corre en http://localhost:3000
// ============================================

const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Permitir requests desde Live Server (puerto 5500)
app.use(cors());

// Aumentar límite porque las imágenes en base64 son pesadas
app.use(express.json({ limit: '20mb' }));

// ============================================
// CONFIGURACIÓN AZURE SQL
// ============================================
const dbConfig = {
    server: 'worldhack-server.database.windows.net',
    database: 'worldhack-db',
    user: 'worldhack_db_admin',
    password: 'Ensenada.2026!',
    options: {
        encrypt: true,               // Azure requiere conexión encriptada
        trustServerCertificate: false
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Pool de conexiones (se reutiliza)
let pool = null;

async function getPool() {
    if (!pool) {
        pool = await sql.connect(dbConfig);
        console.log('Conectado a Azure SQL');
    }
    return pool;
}

// ============================================
// ENDPOINT: Guardar avatar
// POST /api/avatar
// Body: { id_jugador: number, avatar_base64: string }
// ============================================
app.post('/api/avatar', async (req, res) => {
    try {
        const { id_jugador, avatar_base64 } = req.body;

        if (!id_jugador || !avatar_base64) {
            return res.status(400).json({ error: 'Faltan campos: id_jugador y avatar_base64' });
        }

        // Quitar el prefijo "data:image/png;base64," si viene
        const base64Limpio = avatar_base64.replace(/^data:image\/\w+;base64,/, '');

        // Convertir base64 a Buffer (varbinary en SQL)
        const avatarBuffer = Buffer.from(base64Limpio, 'base64');

        console.log(`Guardando avatar para jugador ${id_jugador} (${(avatarBuffer.length / 1024).toFixed(1)} KB)`);

        const db = await getPool();

        // UPSERT: Si ya existe el jugador, actualiza; si no, inserta
        const result = await db.request()
            .input('id_jugador', sql.Int, id_jugador)
            .input('avatar', sql.VarBinary(sql.MAX), avatarBuffer)
            .query(`
                IF EXISTS (SELECT 1 FROM dbo.avatar WHERE id_jugador = @id_jugador)
                    UPDATE dbo.avatar SET avatar = @avatar WHERE id_jugador = @id_jugador
                ELSE
                    INSERT INTO dbo.avatar (id_jugador, avatar) VALUES (@id_jugador, @avatar)
            `);

        console.log(`Avatar guardado para jugador ${id_jugador}`);

        res.json({
            success: true,
            message: `Avatar guardado para jugador ${id_jugador}`,
            size_kb: (avatarBuffer.length / 1024).toFixed(1)
        });

    } catch (error) {
        console.error('Error al guardar avatar:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENDPOINT: Obtener avatar
// GET /api/avatar/:id_jugador
// Retorna la imagen directamente (para usar en <img src="...">)
// ============================================
app.get('/api/avatar/:id_jugador', async (req, res) => {
    try {
        const id_jugador = parseInt(req.params.id_jugador);
        const db = await getPool();

        const result = await db.request()
            .input('id_jugador', sql.Int, id_jugador)
            .query('SELECT avatar FROM dbo.avatar WHERE id_jugador = @id_jugador');

        if (result.recordset.length === 0 || !result.recordset[0].avatar) {
            return res.status(404).json({ error: 'Avatar no encontrado' });
        }

        // Enviar como imagen PNG
        res.set('Content-Type', 'image/png');
        res.send(result.recordset[0].avatar);

    } catch (error) {
        console.error('Error al obtener avatar:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENDPOINT: Obtener TODOS los datos de un jugador
// GET /api/jugador/:id_jugador
// Retorna: jugador, estadisticas, trabajos, trofeos
// ============================================
app.get('/api/jugador/:id_jugador', async (req, res) => {
    try {
        const id_jugador = parseInt(req.params.id_jugador);
        const db = await getPool();

        // Ejecutar todas las consultas en paralelo
        const [jugadorRes, estadisticasRes, trabajosRes, trofeosRes] = await Promise.all([
            db.request()
                .input('id1', sql.Int, id_jugador)
                .query('SELECT id_jugador, nombre FROM dbo.jugador WHERE id_jugador = @id1'),

            db.request()
                .input('id2', sql.Int, id_jugador)
                .query('SELECT advertencias, xp_total, dinero_actual, dinero_total FROM dbo.estadisticas WHERE id_jugador = @id2'),

            db.request()
                .input('id3', sql.Int, id_jugador)
                .query('SELECT id_trabajo, nombre, tipo, estado, recompensa FROM dbo.trabajo WHERE id_jugador = @id3'),

            db.request()
                .input('id4', sql.Int, id_jugador)
                .query(`SELECT t.id_trofeo, t.descripcion
                        FROM dbo.trofeos_por_jugador tp
                        JOIN dbo.trofeo t ON tp.id_trofeo = t.id_trofeo
                        WHERE tp.id_jugador = @id4`)
        ]);

        if (jugadorRes.recordset.length === 0) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        const jugador = jugadorRes.recordset[0];
        const estadisticas = estadisticasRes.recordset[0] || {};
        const trabajos = trabajosRes.recordset;
        const trofeos = trofeosRes.recordset;

        // Calcular estadísticas derivadas de trabajos
        const trabajosNegro = trabajos.filter(t => t.tipo === 'negro').length;
        const trabajosBlanco = trabajos.filter(t => t.tipo === 'blanco').length;
        const trabajosCompletados = trabajos.filter(t => t.estado === 'completado').length;
        const trabajosFallidos = trabajos.filter(t => t.estado === 'fallido').length;

        console.log(`Datos cargados para jugador ${id_jugador} (${jugador.nombre})`);

        res.json({
            jugador: jugador,
            estadisticas: {
                advertencias: estadisticas.advertencias || 0,
                xp_total: estadisticas.xp_total || 0,
                dinero_actual: estadisticas.dinero_actual || 0,
                dinero_total: estadisticas.dinero_total || 0
            },
            trabajos: {
                lista: trabajos,
                negro: trabajosNegro,
                blanco: trabajosBlanco,
                completados: trabajosCompletados,
                fallidos: trabajosFallidos
            },
            trofeos: trofeos,
            avatar_url: `http://localhost:3000/api/avatar/${id_jugador}`
        });

    } catch (error) {
        console.error('Error al obtener jugador:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENDPOINT: Obtener imagen de trofeo
// GET /api/trofeo/:id_trofeo/imagen
// Retorna la imagen del campo 'retrato' como PNG
// ============================================
app.get('/api/trofeo/:id_trofeo/imagen', async (req, res) => {
    try {
        const id_trofeo = parseInt(req.params.id_trofeo);
        const db = await getPool();

        const result = await db.request()
            .input('id_trofeo', sql.Int, id_trofeo)
            .query('SELECT retrato FROM dbo.trofeo WHERE id_trofeo = @id_trofeo');

        if (result.recordset.length === 0 || !result.recordset[0].retrato) {
            return res.status(404).json({ error: 'Imagen de trofeo no encontrada' });
        }

        res.set('Content-Type', 'image/png');
        res.send(result.recordset[0].retrato);

    } catch (error) {
        console.error('Error al obtener imagen de trofeo:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', async (req, res) => {
    try {
        const db = await getPool();
        await db.request().query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: error.message });
    }
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  WorldHack Avatar Server`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`========================================`);
    console.log(`\nEndpoints:`);
    console.log(`  POST /api/avatar          — Guardar avatar`);
    console.log(`  GET  /api/avatar/:id      — Obtener avatar (imagen)`);
    console.log(`  GET  /api/jugador/:id     — Obtener datos del jugador`);
    console.log(`  GET  /api/health          — Health check\n`);
});