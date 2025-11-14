"""
Script de test de connexion SQL Server pour le projet bmw-uk-market-analysis
- Lit une configuration (DRIVER, SERVER, DATABASE, UID, PWD, ENCRYPT)
- Tente une connexion avec pyodbc
- Affiche des diagnostics : erreur pyodbc, résolution DNS, test de port (via socket)

Usage (PowerShell):
  python .\backend\test_sql_connection.py

Ajuste les paramètres dans SQL_SERVER dict si nécessaire.
"""
import socket
import sys
import pyodbc
from pathlib import Path

# Configuration par défaut (à adapter si besoin)
SQL_SERVER = {
    "DRIVER": "{ODBC Driver 17 for SQL Server}",
    "SERVER": "localhost,1433",
    "DATABASE": "AutoSales",
    "UID": "sa",
    "PWD": "",
    "ENCRYPT": "no",
}


def sql_conn_str(cfg):
    parts = [
        f"DRIVER={cfg['DRIVER']}",
        f"SERVER={cfg['SERVER']}",
        f"DATABASE={cfg['DATABASE']}",
        f"UID={cfg['UID']}",
        f"PWD={cfg['PWD']}",
    ]
    if cfg.get("ENCRYPT", "").lower() in ("yes", "true", "required"):
        parts.append("Encrypt=yes;TrustServerCertificate=yes")
    return ";".join(parts)


def test_port(hostport: str, timeout: float = 3.0):
    """Teste la connectivité TCP vers host:port. hostport peut être 'host,port' ou 'host:port' or 'host'."""
    # Extraire host et port
    host = hostport
    port = 1433
    if "," in hostport:
        host, port_s = hostport.split(",", 1)
        try:
            port = int(port_s)
        except ValueError:
            pass
    elif ":" in hostport:
        host, port_s = hostport.split(":", 1)
        try:
            port = int(port_s)
        except ValueError:
            pass
    host = host.strip()
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    try:
        s.connect((host, port))
        s.close()
        return True, f"{host}:{port} reachable"
    except Exception as e:
        return False, str(e)


def try_pyodbc_connect(cfg):
    conn_str = sql_conn_str(cfg)
    print("Using connection string:", conn_str)
    try:
        cn = pyodbc.connect(conn_str, timeout=5)
        cn.close()
        return True, "Connection successful"
    except Exception as e:
        return False, str(e)


if __name__ == '__main__':
    print('--- SQL Server connection diagnostics ---')
    print('Config:')
    for k, v in SQL_SERVER.items():
        masked = '****' if k == 'PWD' and v else v
        print(f"  {k}: {masked}")

    hostport = SQL_SERVER.get('SERVER', 'localhost,1433')
    print(f"\nTesting TCP port to {hostport} ...")
    ok, msg = test_port(hostport)
    print('  Port test:', ok, msg)

    print('\nAttempting pyodbc connection...')
    ok2, msg2 = try_pyodbc_connect(SQL_SERVER)
    print('  pyodbc result:', ok2)
    print('  message:', msg2)

    if not ok:
        print('\nHints:')
        print('- Vérifie que SQL Server est démarré (Services Windows).')
        print('- Vérifie que le Listener TCP est activé et le port 1433 ouvert.')
        print('- Si SQL Server utilise une instance nommée, utilise SERVER="localhost\\INSTANCE" ou "localhost,port"')
    if not ok2:
        print('\npyodbc error troubleshooting:')
        print('- Assure-toi que le pilote ODBC indiqué est installé (ODBC Driver 17/18).')
        print('- Pour Windows, vérifie ODBC Data Sources -> Drivers.')
        print("- S'il y a un message d'erreur spécifique, copie-le et recherche la cause (authentification, port, SSL).")

    print('\nDone')
