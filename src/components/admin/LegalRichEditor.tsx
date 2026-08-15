"use client"

import { useRef, useState, useEffect } from "react"
import {
  Bold, Italic, Underline, Maximize2, Minimize2, Sun, Moon,
  List, Table as TableIcon, Eye, Save, Rocket, Loader2, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const FONT_SIZES = [16, 18, 20] as const

function buildTableHtml(cols: number, rows: number) {
  const headerCells = Array.from({ length: cols }, (_, i) => `<th>Colonne ${i + 1}</th>`).join("")
  const bodyRows = Array.from({ length: rows }, () =>
    `<tr>${Array.from({ length: cols }, () => `<td>&nbsp;</td>`).join("")}</tr>`
  ).join("")
  return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table><p><br></p>`
}

interface LegalRichEditorProps {
  initialHtml: string
  published: boolean
  saving?: boolean
  onSave: (html: string) => void
  onPublish: (html: string) => void
}

export function LegalRichEditor({ initialHtml, published, saving, onSave, onPublish }: LegalRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState<typeof FONT_SIZES[number]>(16)
  const [darkMode, setDarkMode] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [tableCols, setTableCols] = useState(4)
  const [tableRows, setTableRows] = useState(5)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialHtml) {
      editorRef.current.innerHTML = initialHtml || ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    setDirty(true)
  }

  const insertTable = () => {
    editorRef.current?.focus()
    document.execCommand("insertHTML", false, buildTableHtml(tableCols, tableRows))
    setDirty(true)
  }

  const currentHtml = () => editorRef.current?.innerHTML || ""

  return (
    <div className={fullscreen ? "fixed inset-0 z-[100] bg-white flex flex-col p-6" : "space-y-3"}>
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-2">
        <ToolbarButton onClick={() => exec("bold")} title="Gras"><Bold className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} title="Italique"><Italic className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} title="Souligné"><Underline className="h-4 w-4" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => exec("formatBlock", "H1")} title="Titre H1"><span className="text-xs font-bold">H1</span></ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "H2")} title="Titre H2"><span className="text-xs font-bold">H2</span></ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "H3")} title="Titre H3"><span className="text-xs font-bold">H3</span></ToolbarButton>
        <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Liste à puces"><List className="h-4 w-4" /></ToolbarButton>
        <Divider />

        {/* Taille de police dynamique */}
        <select
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value) as typeof FONT_SIZES[number])}
          className="text-xs font-medium border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none"
          title="Taille de police"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}px {s === 16 ? "(Confort)" : s === 18 ? "(Grand)" : "(Très grand)"}</option>
          ))}
        </select>

        {/* Mode contraste */}
        <ToolbarButton onClick={() => setDarkMode((d) => !d)} title={darkMode ? "Mode Clair" : "Mode Sombre"}>
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </ToolbarButton>

        {/* Plein écran */}
        <ToolbarButton onClick={() => setFullscreen((f) => !f)} title={fullscreen ? "Quitter le plein écran" : "Plein écran"}>
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </ToolbarButton>

        <div className="flex-1" />
        <ToolbarButton onClick={() => setPreviewOpen(true)} title="Prévisualiser en direct"><Eye className="h-4 w-4" /></ToolbarButton>
      </div>

      {/* Générateur de tableaux */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-2 text-xs">
        <TableIcon className="h-4 w-4 text-gray-400" />
        <span className="text-gray-500 font-medium">Générateur de tableau :</span>
        <span>Colonnes</span>
        <select value={tableCols} onChange={(e) => setTableCols(Number(e.target.value))} className="border border-gray-200 rounded-lg px-1.5 py-1 bg-white outline-none">
          {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span>Lignes</span>
        <select value={tableRows} onChange={(e) => setTableRows(Number(e.target.value))} className="border border-gray-200 rounded-lg px-1.5 py-1 bg-white outline-none">
          {[2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <Button size="sm" variant="outline" onClick={insertTable} className="h-7 text-xs">+ Générer le Tableau</Button>
        <span className="text-gray-400 ml-2">— ou collez (Ctrl+V) un tableau copié depuis Word directement dans la zone ci-dessous.</span>
      </div>

      {/* Zone de rédaction */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => setDirty(true)}
        onPaste={() => setDirty(true)}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
        className={`legal-rich-content outline-none border-2 rounded-xl p-4 overflow-y-auto transition-colors ${
          fullscreen ? "flex-1" : "min-h-[220px]"
        } ${
          darkMode ? "bg-[#0f1720] text-gray-100 border-gray-700" : "bg-white text-gray-800 border-gray-200 focus:border-[#00BFA6]"
        }`}
        data-placeholder="Rédigez ou collez vos obligations légales ici..."
      />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={() => { onSave(currentHtml()); setDirty(false) }} disabled={saving} className="bg-gray-900 hover:bg-black text-white">
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Enregistrer les modifications
        </Button>
        <Button onClick={() => { onPublish(currentHtml()); setDirty(false) }} disabled={saving} className="bg-[#00BFA6] hover:bg-[#00908A] text-white">
          <Rocket className="h-4 w-4 mr-1" /> Publier sur le site public
        </Button>
        {published ? (
          <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Publié</span>
        ) : (
          <span className="text-xs text-amber-600 font-bold">Brouillon non publié</span>
        )}
        {dirty && <span className="text-xs text-gray-400">Modifications non enregistrées</span>}
      </div>

      {/* Prévisualisation en direct */}
      {previewOpen && (
        <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-6" onClick={() => setPreviewOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Aperçu du rendu final</h3>
              <button onClick={() => setPreviewOpen(false)} className="text-gray-400 hover:text-gray-700 text-sm font-bold">Fermer ✕</button>
            </div>
            <div className="legal-rich-content text-gray-700" dangerouslySetInnerHTML={{ __html: currentHtml() }} />
          </div>
        </div>
      )}
    </div>
  )
}

function ToolbarButton({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-colors"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />
}
