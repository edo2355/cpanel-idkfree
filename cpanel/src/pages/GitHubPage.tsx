import { useState } from 'react';
import { GitBranch, FileCode, ArrowLeft } from 'lucide-react';

const REPO = 'edo2355/cpanel-idkfree';
const BRANCH = 'main';

export default function GitHubPage() {
  const [tree, setTree] = useState<any[] | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadTree = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`);
      const data = await res.json();
      if (data.tree) {
        // Filtrar solo archivos de código (ts, tsx, sql, json, md)
        const allowed = data.tree.filter((f: any) => 
          f.type === 'blob' && 
          /\.(ts|tsx|sql|json|md|js|css|html)$/.test(f.path) &&
          !f.path.includes('node_modules')
        );
        setTree(allowed);
      }
    } catch (err) {
      alert('Error cargando GitHub');
    } finally {
      setLoading(false);
    }
  };

  const openFile = async (path: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`);
      const text = await res.text();
      setFileContent(text);
      setCurrentPath(path);
    } catch {
      setFileContent('Error cargando el archivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <GitBranch color="#00f2fe" /> Explorador de Código (GitHub)
      </h2>
      <p style={{ color: '#a0a5b1', fontSize: '14px', marginBottom: '20px' }}>
        Visualiza los archivos del repositorio en tiempo real. (Solo lectura)
      </p>

      {loading && <p>Cargando...</p>}

      {!tree && !loading && (
        <button onClick={loadTree} style={{ background: '#00f2fe', color: '#000', padding: '10px 20px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          CARGAR ARCHIVOS DEL REPO
        </button>
      )}

      {fileContent !== null && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setFileContent(null)} style={{ background: 'transparent', color: '#00f2fe', border: '1px solid #00f2fe', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
            <ArrowLeft size={16} /> Volver a la lista
          </button>
          <div style={{ background: '#181b21', border: '1px solid #2a2e39', borderRadius: '8px', padding: '20px', overflowX: 'auto' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#a0a5b1', fontSize: '12px' }}>{currentPath}</h4>
            <pre style={{ margin: 0, color: '#fff', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {fileContent}
            </pre>
          </div>
        </div>
      )}

      {tree && !fileContent && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px', marginTop: '20px' }}>
          {tree.map((file: any) => (
            <div key={file.path} onClick={() => openFile(file.path)} style={{ background: '#181b21', border: '1px solid #2a2e39', padding: '10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <FileCode size={16} color="#00f2fe" />
              <span style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.path}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
