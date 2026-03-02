import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BUCKET_NAME = 'avatares-perfil';

async function setupStorageAvatars() {
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
      console.log(`✅ Bucket '${BUCKET_NAME}' já existe! Atualizando configurações...`);
      const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
        public: true, // Público para que URLs funcionem diretamente no frontend
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ],
      });
      if (updateError) throw updateError;
      console.log(`✅ Bucket '${BUCKET_NAME}' atualizado com sucesso!`);
    } else {
      console.log(`🆕 Criando bucket '${BUCKET_NAME}'...`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Público para que URLs funcionem diretamente no frontend
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ],
      });

      if (createError) throw createError;
      console.log(`✅ Bucket '${BUCKET_NAME}' criado com sucesso!`);
    }

    console.log('\n📁 Estrutura de pastas dentro do bucket:');
    console.log('  avatares-perfil/');
    console.log('    users/         → Fotos de perfil dos usuários (admins)');
    console.log('    representatives/ → Fotos de perfil dos representantes comerciais');

    console.log('\n🎉 Configuração do bucket de avatares concluída com sucesso!');
    console.log('\n💡 As fotos de perfil são públicas (leitura) mas o upload');
    console.log('   é controlado pelo backend com autenticação JWT.\n');
  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message || error);
    process.exit(1);
  }
}

setupStorageAvatars();
