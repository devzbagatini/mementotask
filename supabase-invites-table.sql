-- Criar tabela de convites pendentes
CREATE TABLE IF NOT EXISTS workspace_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES auth.users(id),
  UNIQUE(workspace_id, email)
);

-- RLS para workspace_invites
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

-- Políticas para workspace_invites
CREATE POLICY "workspace_invites_select_owner"
    ON workspace_invites FOR SELECT
    USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "workspace_invites_select_invited"
    ON workspace_invites FOR SELECT
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "workspace_invites_insert"
    ON workspace_invites FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "workspace_invites_update"
    ON workspace_invites FOR UPDATE
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "workspace_invites_delete"
    ON workspace_invites FOR DELETE
    USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
    );

-- Índices
CREATE INDEX IF NOT EXISTS idx_workspace_invites_workspace ON workspace_invites(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_email ON workspace_invites(email);

-- Função para aceitar convite
CREATE OR REPLACE FUNCTION accept_workspace_invite(invite_id UUID, user_id UUID)
RETURNS VOID AS $$
DECLARE
    invite_record RECORD;
    user_email TEXT;
BEGIN
    -- Buscar email do usuário
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    
    -- Buscar convite
    SELECT * INTO invite_record 
    FROM workspace_invites 
    WHERE id = invite_id AND email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Convite não encontrado ou não pertence a este usuário';
    END IF;
    
    -- Inserir como membro
    INSERT INTO workspace_members (workspace_id, user_id, role, invited_by)
    VALUES (invite_record.workspace_id, user_id, invite_record.role, invite_record.invited_by);
    
    -- Marcar convite como aceito
    UPDATE workspace_invites 
    SET accepted_at = NOW(), accepted_by = user_id
    WHERE id = invite_id;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ Sistema de convites criado!' as status;
