-- CorrigeFácil Database Schema
-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  escola TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provas table
CREATE TABLE IF NOT EXISTS public.provas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  total_alunos INTEGER DEFAULT 0,
  alunos_corrigidos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questoes table
CREATE TABLE IF NOT EXISTS public.questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id UUID NOT NULL REFERENCES public.provas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('mc', 'escrita')),
  enunciado TEXT,
  resposta_correta TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Correcoes table (student exam corrections)
CREATE TABLE IF NOT EXISTS public.correcoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id UUID NOT NULL REFERENCES public.provas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_aluno TEXT NOT NULL,
  imagem_url TEXT,
  nota DECIMAL(4,2),
  acertos INTEGER DEFAULT 0,
  parciais INTEGER DEFAULT 0,
  erros INTEGER DEFAULT 0,
  status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluida')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Respostas table (individual answers per correction)
CREATE TABLE IF NOT EXISTS public.respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correcao_id UUID NOT NULL REFERENCES public.correcoes(id) ON DELETE CASCADE,
  questao_id UUID NOT NULL REFERENCES public.questoes(id) ON DELETE CASCADE,
  resposta_aluno TEXT,
  resposta_esperada TEXT NOT NULL,
  sugestao_ia TEXT CHECK (sugestao_ia IN ('correct', 'partial', 'wrong')),
  resultado_final TEXT CHECK (resultado_final IN ('correct', 'partial', 'wrong')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Provas policies
CREATE POLICY "provas_select_own" ON public.provas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "provas_insert_own" ON public.provas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "provas_update_own" ON public.provas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "provas_delete_own" ON public.provas FOR DELETE USING (auth.uid() = user_id);

-- Questoes policies (based on prova ownership)
CREATE POLICY "questoes_select_own" ON public.questoes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.provas WHERE id = questoes.prova_id AND user_id = auth.uid()));
CREATE POLICY "questoes_insert_own" ON public.questoes FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.provas WHERE id = questoes.prova_id AND user_id = auth.uid()));
CREATE POLICY "questoes_update_own" ON public.questoes FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.provas WHERE id = questoes.prova_id AND user_id = auth.uid()));
CREATE POLICY "questoes_delete_own" ON public.questoes FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.provas WHERE id = questoes.prova_id AND user_id = auth.uid()));

-- Correcoes policies
CREATE POLICY "correcoes_select_own" ON public.correcoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "correcoes_insert_own" ON public.correcoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "correcoes_update_own" ON public.correcoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "correcoes_delete_own" ON public.correcoes FOR DELETE USING (auth.uid() = user_id);

-- Respostas policies (based on correcao ownership)
CREATE POLICY "respostas_select_own" ON public.respostas FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.correcoes WHERE id = respostas.correcao_id AND user_id = auth.uid()));
CREATE POLICY "respostas_insert_own" ON public.respostas FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.correcoes WHERE id = respostas.correcao_id AND user_id = auth.uid()));
CREATE POLICY "respostas_update_own" ON public.respostas FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.correcoes WHERE id = respostas.correcao_id AND user_id = auth.uid()));
CREATE POLICY "respostas_delete_own" ON public.respostas FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.correcoes WHERE id = respostas.correcao_id AND user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provas_user_id ON public.provas(user_id);
CREATE INDEX IF NOT EXISTS idx_questoes_prova_id ON public.questoes(prova_id);
CREATE INDEX IF NOT EXISTS idx_correcoes_prova_id ON public.correcoes(prova_id);
CREATE INDEX IF NOT EXISTS idx_correcoes_user_id ON public.correcoes(user_id);
CREATE INDEX IF NOT EXISTS idx_respostas_correcao_id ON public.respostas(correcao_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, escola)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', 'Professor'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'escola'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update prova statistics
CREATE OR REPLACE FUNCTION public.update_prova_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.provas
    SET 
      total_alunos = (SELECT COUNT(*) FROM public.correcoes WHERE prova_id = NEW.prova_id),
      alunos_corrigidos = (SELECT COUNT(*) FROM public.correcoes WHERE prova_id = NEW.prova_id AND status = 'concluida'),
      status = CASE 
        WHEN (SELECT COUNT(*) FROM public.correcoes WHERE prova_id = NEW.prova_id) = 0 THEN 'pendente'
        WHEN (SELECT COUNT(*) FROM public.correcoes WHERE prova_id = NEW.prova_id AND status = 'concluida') = 
             (SELECT COUNT(*) FROM public.correcoes WHERE prova_id = NEW.prova_id) THEN 'concluida'
        ELSE 'em_andamento'
      END,
      updated_at = NOW()
    WHERE id = NEW.prova_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.provas
    SET 
      total_alunos = (SELECT COUNT(*) FROM public.correcoes WHERE prova_id = OLD.prova_id),
      alunos_corrigidos = (SELECT COUNT(*) FROM public.correcoes WHERE prova_id = OLD.prova_id AND status = 'concluida'),
      updated_at = NOW()
    WHERE id = OLD.prova_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS on_correcao_change ON public.correcoes;

CREATE TRIGGER on_correcao_change
  AFTER INSERT OR UPDATE OR DELETE ON public.correcoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prova_stats();
