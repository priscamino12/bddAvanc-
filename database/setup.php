<?php

require_once __DIR__ . '/connection.php';

echo "=== Initialisation de la base de données ===\n";

$pdo_default = getDefaultPdo();
echo "Connexion à la base par défaut '" . DB_DEFAULT . "' OK.\n";

// Vérifier si la base existe
$stmt = $pdo_default->prepare("SELECT 1 FROM pg_database WHERE datname = ?");
$stmt->execute([DB_NAME]);
$exists = $stmt->fetchColumn();

if ($exists) {
    echo "La base '" . DB_NAME . "' existe déjà.\n";
} else {
    echo "Création de la base '" . DB_NAME . "'...\n";
    $pdo_default->exec("CREATE DATABASE \"" . DB_NAME . "\" WITH OWNER = \"" . DB_USER . "\" ENCODING = 'UTF8' TEMPLATE = template0;");
    echo "Base créée avec succès.\n";
}

$pdo_default = null;

// Connexion à la base cible
$pdo = getAppPdo();
echo "Connexion à '" . DB_NAME . "' OK.\n";

try {
    $pdo->exec("
        -- Produit : clé primaire manuelle (pas SERIAL)
        CREATE TABLE IF NOT EXISTS user(
            id INTEGER PRIMARY KEY,
            nom VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS produit (
            n_produit INTEGER PRIMARY KEY,
            design VARCHAR(255) NOT NULL,
            stock INTEGER DEFAULT 0
        );

        -- Fournisseur : clé primaire manuelle + id auto pour usage interne si besoin
        CREATE TABLE IF NOT EXISTS fournisseur (
            n_frs INTEGER PRIMARY KEY,
            nom VARCHAR(255) NOT NULL
        );

        -- Approvisionnement : clé composite
        CREATE TABLE IF NOT EXISTS approvisionnement (
            n_frs INTEGER NOT NULL,
            n_produit INTEGER NOT NULL,
            qte_entree INTEGER NOT NULL CHECK (qte_entree >= 0),
            PRIMARY KEY (n_frs, n_produit),
            FOREIGN KEY (n_frs) REFERENCES fournisseur(n_frs) ON DELETE CASCADE,
            FOREIGN KEY (n_produit) REFERENCES produit(n_produit) ON DELETE CASCADE
        );

        -- Audit : id auto
        CREATE TABLE IF NOT EXISTS audit_approvisionnement (
            id SERIAL PRIMARY KEY,
            type_action VARCHAR(20) NOT NULL CHECK (type_action IN ('ajout', 'modification', 'suppression')),
            date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            nom VARCHAR(255),
            design VARCHAR(255),
            qte_entree_ancien INTEGER,
            qte_entree_nouv INTEGER,
            utilisateur VARCHAR(100) DEFAULT current_user
        );

        DROP TRIGGER IF EXISTS trig_approvisionnement ON approvisionnement;

        CREATE OR REPLACE FUNCTION update_stock_and_audit()
        RETURNS TRIGGER AS $$
        BEGIN
            IF (TG_OP = 'INSERT') THEN
                UPDATE produit SET stock = stock + NEW.qte_entree WHERE n_produit = NEW.n_produit;
                INSERT INTO audit_approvisionnement (type_action, nom, design, qte_entree_nouv)
                SELECT 'ajout', f.nom, p.design, NEW.qte_entree
                FROM fournisseur f JOIN produit p ON f.n_frs = NEW.n_frs AND p.n_produit = NEW.n_produit;

            ELSIF (TG_OP = 'UPDATE') THEN
                UPDATE produit SET stock = stock + (NEW.qte_entree - OLD.qte_entree) WHERE n_produit = NEW.n_produit;
                INSERT INTO audit_approvisionnement (type_action, nom, design, qte_entree_ancien, qte_entree_nouv)
                SELECT 'modification', f.nom, p.design, OLD.qte_entree, NEW.qte_entree
                FROM fournisseur f JOIN produit p ON f.n_frs = NEW.n_frs AND p.n_produit = NEW.n_produit;

            ELSIF (TG_OP = 'DELETE') THEN
                UPDATE produit SET stock = stock - OLD.qte_entree WHERE n_produit = OLD.n_produit;
                INSERT INTO audit_approvisionnement (type_action, nom, design, qte_entree_ancien)
                SELECT 'suppression', f.nom, p.design, OLD.qte_entree
                FROM fournisseur f JOIN produit p ON f.n_frs = OLD.n_frs AND p.n_produit = OLD.n_produit;
            END IF;
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trig_approvisionnement
        AFTER INSERT OR UPDATE OR DELETE ON approvisionnement
        FOR EACH ROW EXECUTE FUNCTION update_stock_and_audit();
    ");

    echo "Tables et trigger créés/vérifiés avec succès.\n";
    echo "Exécute maintenant : php -S localhost:8000 api.php\n";

} catch (PDOException $e) {
    echo "Erreur lors de la création : " . $e->getMessage() . "\n";
}