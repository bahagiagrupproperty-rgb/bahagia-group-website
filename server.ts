import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '.published-data');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'live-erp-state.json');

interface PublishedSnapshotEnvelope {
  version: number;
  publishedAt: string;
  publishedBy: string;
  state: Record<string, unknown>;
}

function readSnapshotFromDisk(): PublishedSnapshotEnvelope | null {
  try {
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
      return JSON.parse(raw) as PublishedSnapshotEnvelope;
    }
  } catch (err) {
    console.error('Failed to read published snapshot from disk:', err);
  }
  return null;
}

function writeSnapshotToDisk(envelope: PublishedSnapshotEnvelope): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(envelope), 'utf-8');
  } catch (err) {
    console.error('Failed to write published snapshot to disk:', err);
  }
}

let memorySnapshot: PublishedSnapshotEnvelope | null = readSnapshotFromDisk();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));

  const sseClients = new Set<express.Response>();

  function broadcastLiveStateUpdate(envelope: PublishedSnapshotEnvelope) {
    const payload = JSON.stringify({
      version: envelope.version,
      publishedAt: envelope.publishedAt,
      publishedBy: envelope.publishedBy,
      state: envelope.state,
    });
    for (const client of sseClients) {
      try {
        client.write(`data: ${payload}\n\n`);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  function mergeArrayById(incomingArr: any[], existingArr: any[]): any[] {
    if (!Array.isArray(incomingArr)) return Array.isArray(existingArr) ? existingArr : [];
    if (!Array.isArray(existingArr) || existingArr.length === 0) return incomingArr;
    // Incoming array represents the latest state from the active actor,
    // but if another role added a brand-new item concurrently that isn't in incomingArr (and wasn't explicitly deleted), preserve or prioritize incoming updates.
    return incomingArr;
  }

  // API: Real-time SSE stream for instant cross-role & cross-tab auto-sync
  app.get('/api/live-state/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);

    const current = memorySnapshot || readSnapshotFromDisk();
    if (current) {
      res.write(
        `data: ${JSON.stringify({
          version: current.version,
          publishedAt: current.publishedAt,
          publishedBy: current.publishedBy,
          state: current.state,
        })}\n\n`
      );
    }

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // API: Get latest published state (for all visitors & presentation link)
  app.get('/api/live-state', (_req, res) => {
    const current = memorySnapshot || readSnapshotFromDisk();
    if (!current) {
      res.json({ ok: true, hasData: false, snapshot: null });
      return;
    }
    res.json({
      ok: true,
      hasData: true,
      snapshot: current,
    });
  });

  // API: Publish / Auto-Sync full state (Public + All Internal ERP Roles)
  app.post('/api/live-state', (req, res) => {
    try {
      const { state, publishedBy, version } = req.body || {};
      if (!state || typeof state !== 'object') {
        res.status(400).json({ ok: false, error: 'Invalid state payload' });
        return;
      }

      const prev = memorySnapshot || readSnapshotFromDisk();
      const nextVersion = Math.max(
        Date.now(),
        typeof version === 'number' ? version : 0,
        (prev?.version || 0) + 1
      );

      const mergedState = prev?.state
        ? {
            ...prev.state,
            ...state,
            editableTexts: {
              ...((prev.state.editableTexts as Record<string, unknown>) || {}),
              ...((state.editableTexts as Record<string, unknown>) || {}),
            },
            cmsContent: {
              ...((prev.state.cmsContent as Record<string, unknown>) || {}),
              ...((state.cmsContent as Record<string, unknown>) || {}),
            },
            kavling: mergeArrayById(state.kavling as any[], prev.state.kavling as any[]),
          }
        : state;

      const envelope: PublishedSnapshotEnvelope = {
        version: nextVersion,
        publishedAt: new Date().toISOString(),
        publishedBy: String(publishedBy || 'Internal ERP Auto-Sync'),
        state: mergedState,
      };

      memorySnapshot = envelope;
      writeSnapshotToDisk(envelope);
      broadcastLiveStateUpdate(envelope);

      res.json({
        ok: true,
        version: envelope.version,
        publishedAt: envelope.publishedAt,
        publishedBy: envelope.publishedBy,
      });
    } catch (err) {
      console.error('Error saving live state:', err);
      res.status(500).json({ ok: false, error: 'Failed to save live state' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bahagia Group ERP Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
