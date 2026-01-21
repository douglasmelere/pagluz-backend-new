import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BUCKET_NAME = 'faturas-representantes';

async function setupStorage() {
  console.log('🔧 Configurando Supabase Storage...\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
    process.exit(1);
  }

  console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Lista todos os buckets existentes
    console.log('\n📋 Listando buckets existentes...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      throw listError;
    }

    console.log(`✅ Encontrados ${buckets?.length || 0} buckets:`);
    buckets?.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
    });

    // Verifica se o bucket já existe
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

    if (bucketExists) {
      console.log(`\n✅ Bucket '${BUCKET_NAME}' já existe!`);
      
      // Verifica e atualiza as configurações do bucket
      console.log('\n🔄 Verificando configurações do bucket...');
      const { data: bucketInfo, error: getError } = await supabase.storage.getBucket(BUCKET_NAME);
      
      if (getError) {
        console.warn('⚠️ Não foi possível obter informações do bucket:', getError.message);
      } else {
        console.log(`   Status atual: ${bucketInfo.public ? 'Público' : 'Privado'}`);
        
        // Se o bucket não for público, torna-o público
        if (!bucketInfo.public) {
          console.log('🔄 Tornando bucket público...');
          const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
            public: false, // Mantém privado por segurança (acesso via backend)
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: [
              'image/jpeg',
              'image/jpg', 
              'image/png',
              'image/webp',
              'application/pdf'
            ]
          });
          
          if (updateError) {
            console.warn('⚠️ Não foi possível atualizar bucket:', updateError.message);
          } else {
            console.log('✅ Configurações do bucket atualizadas!');
          }
        }
      }
    } else {
      // Cria o bucket
      console.log(`\n🆕 Criando bucket '${BUCKET_NAME}'...`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Mantém privado por segurança (acesso via backend)
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png', 
          'image/webp',
          'application/pdf'
        ]
      });

      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError);
        throw createError;
      }

      console.log(`✅ Bucket '${BUCKET_NAME}' criado com sucesso!`);
      console.log('   - Tipo: Privado (acesso via backend)');
      console.log('   - Tamanho máximo: 10MB');
      console.log('   - Formatos permitidos: JPG, PNG, WEBP, PDF');
    }

    // Testa upload e download
    console.log('\n🧪 Testando upload e download...');
    const testFileName = 'test-file.pdf';
    const testContent = 'Test file created at ' + new Date().toISOString();
    const testBuffer = Buffer.from(testContent);

    // Upload de teste
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(testFileName, testBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Erro ao testar upload:', uploadError);
      throw uploadError;
    }
    console.log('✅ Upload de teste realizado com sucesso!');

    // Download de teste
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(testFileName);

    if (downloadError) {
      console.error('❌ Erro ao testar download:', downloadError);
      throw downloadError;
    }
    console.log('✅ Download de teste realizado com sucesso!');

    // Remove arquivo de teste
    await supabase.storage.from(BUCKET_NAME).remove([testFileName]);
    console.log('✅ Arquivo de teste removido!');

    console.log('\n🎉 Configuração do Supabase Storage concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. O bucket está configurado e funcionando');
    console.log('   2. Você pode fazer upload de faturas pelo sistema');
    console.log('   3. As faturas serão armazenadas com segurança');
    
  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message || error);
    console.error('\n💡 Possíveis soluções:');
    console.error('   1. Verifique se o SUPABASE_SERVICE_ROLE_KEY está correto');
    console.error('   2. Verifique se o Supabase está acessível');
    console.error('   3. Verifique se você tem permissões de administrador no Supabase');
    process.exit(1);
  }
}

// Executa o script
setupStorage();
