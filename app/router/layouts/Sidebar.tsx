import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, File as FileIcon, Folder as FolderIcon, FolderOpen, X } from 'lucide-react';
import PagesPanel from '../../../features/apps/components/PagesPanel';
import TablePanel from '../../../features/data/components/TablePanel';
import { useEditorStore } from '../../../stores/useEditorStore';
import { FileSystemNode, FileType } from '../../../types';

// --- File Tree Component ---
interface FileTreeProps {
  node: FileSystemNode;
  depth: number;
}

const FileTree: React.FC<FileTreeProps> = ({ node, depth }) => {
  const { activeTabId, openFile, toggleFolder, tabs } = useEditorStore();
  
  // Determine if this file is the active one
  const isActive = node.type === FileType.FILE && tabs.find(t => t.id === activeTabId)?.fileId === node.id;
  
  const paddingLeft = `${depth * 12 + 12}px`;

  if (node.type === FileType.FILE) {
    return (
      <div
        onClick={() => openFile(node)}
        className={`flex items-center py-1.5 cursor-pointer text-sm select-none transition-colors rounded-sm mx-1 ${
          isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground hover:bg-accent/50'
        }`}
        style={{ paddingLeft }}
      >
        <FileIcon size={14} className="mr-2 text-blue-500" />
        <span>{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => toggleFolder(node.id)}
        className="flex items-center py-1.5 cursor-pointer text-sm text-foreground hover:bg-accent/50 select-none transition-colors rounded-sm mx-1"
        style={{ paddingLeft }}
      >
        <span className="mr-1 text-muted-foreground">
           {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {node.isOpen ? (
          <FolderOpen size={14} className="mr-2 text-yellow-500" />
        ) : (
          <FolderIcon size={14} className="mr-2 text-yellow-500" />
        )}
        <span className="font-medium">{node.name}</span>
      </div>
      {node.isOpen &&
        node.children?.map((child) => (
          <FileTree
            key={child.id}
            node={child}
            depth={depth + 1}
          />
        ))}
    </div>
  );
};

// --- Main Sidebar Container ---
interface SidebarProps {
  width: number;
}

const Sidebar: React.FC<SidebarProps> = ({ width }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tableName } = useParams();
  const { files } = useEditorStore();

  const renderContent = () => {
    if (location.pathname.startsWith('/apps')) {
      return <PagesPanel />;
    }
    if (location.pathname.startsWith('/data')) {
      return (
        <TablePanel 
          activeTable={tableName} 
          onTableSelect={(table) => navigate(`/data/${table}`)} 
        />
      );
    }
    if (location.pathname.startsWith('/code')) {
      return (
        <div className="flex flex-col h-full">
           <div className="h-12 px-4 border-b border-border flex items-center shrink-0">
             <span className="font-medium text-sm text-foreground">Explorer</span>
           </div>
           <div className="flex-1 overflow-y-auto py-2">
              {files.map(node => (
                <FileTree key={node.id} node={node} depth={0} />
              ))}
           </div>
        </div>
      );
    }

    return (
        <div className="flex flex-col h-full items-center justify-center text-muted-foreground text-sm">
           <div className="mb-2"><X size={24} /></div>
           <span>暂无内容</span>
        </div>
    );
  };

  return (
    <div 
      style={{ width }}
      className="flex flex-col bg-card h-full shrink-0 transition-colors relative z-20 overflow-hidden"
    >
      {renderContent()}
    </div>
  );
};

export default Sidebar;