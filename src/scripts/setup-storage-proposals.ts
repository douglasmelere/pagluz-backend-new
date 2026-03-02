import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BUCKET_NAME = 'propostas-representantes';

async function setupStorageProposals() {
  console.log(`🔧 Configurando Supabase Storage para: ${BUCKET_NAME}...\n`);

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

    if (bucketExists) {
      console.log(`✅ Bucket '${BUCKET_NAME}' já existe! Ajustando para manter privado e permitir novos mimetypes.`);
      await supabase.storage.updateBucket(BUCKET_NAME, {
        public: false, // privado para backend assinar
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'application/pdf',
        ]
      });
    } else {
      console.log(`🆕 Criando bucket '${BUCKET_NAME}'...`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 52428800,
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'application/pdf',
        ]
      });

      if (createError) throw createError;
      console.log(`✅ Bucket '${BUCKET_NAME}' criado com sucesso!`);
    }

    console.log('\n🎉 Configuração do Supabase Storage para Propostas concluída com sucesso!');
  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message || error);
    process.exit(1);
  }
}

setupStorageProposals();
