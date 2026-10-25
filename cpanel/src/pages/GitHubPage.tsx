import { useState } from 'react';
import { GitBranch, FileCode, ArrowLeft, Folder, FolderOpen, ChevronRight } from 'lucide-react';

const REPO = 'edo2355/cpanel-idkfree';
const BRANCH = 'main';

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
}

function buildTree(files: any[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let currentLevel = root;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (isFile) {
        currentLevel.push({ name: part, path: currentPath, type: 'file' });
      } else {
        let folder = currentLevel.find((n) => n.name === part && n.type === 'folder');
        if (!folder) {
          folder = { name: part, path: currentPath, type: 'folder', children: [] };
          currentLevel.push(folder);
        }
        currentLevel = folder.children!;
      }
    }
  }

  // Ordenar: carpetas primero, luego archivos, todo alfabético
  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => n.children && sortTree(n.children));
  };
  sortTree(root);

  return root;
}

function TreeItem({ node, level, expanded, toggle, openFile }: any) {
  const isExpanded = expanded.has(node.path);
  const indent = level * 20;

  if (node.type === 'folder') {
    return (
      <>
        <div
          onClick={() => toggle(node.path)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            padding: '6px 10px', paddingLeft: `${10 + indent}px`,
            background: '#181b21', borderBottom: '1px solid #2a2e39',
            fontSize: '13px', fontFamily: 'monospace', color: '#00f2fe',
          }}
        >
          <ChevronRight
            size={14}
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}
          />
          {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
          {node.name}
        </div>
        {isExpanded &&
          node.children.map((child: any) => (
            <TreeItem
              key={child.path}
              node={child}
              level={level + 1}
              expanded={expanded}
              toggle={toggle}
              openFile={openFile}
            />
          ))}
      </>
    );
  }

  return (
    <div
      onClick={() => openFile(node.path)}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
        padding: '6px 10px', paddingLeft: `${10 + indent + 14}px`,
        background: '#181b21', borderBottom: '1px solid #2a2e39',
        fontSize: '13px', fontFamily: 'monospace', color: '#fff',
      }}
    >
      <FileCode size={14} color="#a0a5b1" />
      {node.name}
    </div>
  );
}

export default function GitHubPage() {
  const [tree, setTree] = useState<TreeNode[] | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(['cpanel/src', 'cpanel-backend/src'])
  );

  const loadTree = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`
      );
      const data = await res.json();
      if (data.tree) {
        const allowed = data.tree.filter(
          (f: any) =>
            f.type === 'blob' &&
            /\.(ts|tsx|sql|json|md|js|css|html)$/.test(f.path) &&
            !f.path.includes('node_modules')
        );
        setTree(buildTree(allowed));
      }
    } catch (err) {
      alert('Error cargando GitHub');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
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
        Visualiza los archivos del repositorio como un árbol. (Solo lectura)
      </p>

      {loading && <p>Cargando...</p>}

      {!tree && !loading && (
        <button
          onClick={loadTree}
          style={{
            background: '#00f2fe', color: '#000', padding: '10px 20px',
            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
          }}
        >
          CARGAR ÁRBOL DEL REPO
        </button>
      )}

      {fileContent !== null && (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => setFileContent(null)}
            style={{
              background: 'transparent', color: '#00f2fe', border: '1px solid #00f2fe',
              padding: '8px 15px', borderRadius: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px',
            }}
          >
            <ArrowLeft size={16} /> Volver al árbol
          </button>
          <div
            style={{
              background: '#181b21', border: '1px solid #2a2e39',
              borderRadius: '8px', padding: '20px', overflowX: 'auto',
            }}
          >
            <h4 style={{ margin: '0 0 10px 0', color: '#a0a5b1', fontSize: '12px' }}>
              {currentPath}
            </h4>
            <pre
              style={{
                margin: 0, color: '#fff', fontSize: '13px',
                fontFamily: 'monospace', whiteSpace: 'pre-wrap',
              }}
            >
              {fileContent}
            </pre>
          </div>
        </div>
      )}

      {tree && !fileContent && (
        <div
          style={{
            background: '#0f1115', border: '1px solid #2a2e39',
            borderRadius: '8px', overflow: 'hidden', marginTop: '20px',
          }}
        >
          {tree.map((node) => (
            <TreeItem
              key={node.path}
              node={node}
              level={0}
              expanded={expanded}
              toggle={toggle}
              openFile={openFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
