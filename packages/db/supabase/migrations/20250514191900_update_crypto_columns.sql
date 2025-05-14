-- update columns to be NOT NULL
ALTER TABLE snippets
ALTER COLUMN initialization_vector SET NOT NULL,
ALTER COLUMN auth_tag SET NOT NULL;

