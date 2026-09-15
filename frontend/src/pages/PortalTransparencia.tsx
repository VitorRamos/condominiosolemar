import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

type FinancialEntry = {
  id: number
  entry_date: string
  type: 'Entrada' | 'Saída'
  description: string
  category: string
  value: number
  document_id?: number | null
}

type ParsedEntry = Omit<FinancialEntry, 'id' | 'entry_date' | 'document_id'>

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const currentDate = new Date()
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function PortalTransparencia() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState<'Entrada' | 'Saída'>('Entrada')
  const [value, setValue] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingDocumentId, setEditingDocumentId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [canManage, setCanManage] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  const [extractedText, setExtractedText] = useState('')
  const [documentId, setDocumentId] = useState<number | null>(null)
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([])

  useEffect(() => {
    if (!session?.user) return
    supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }) => {
      setCanManage(data?.role === 'ADMIN' || data?.role === 'SINDICO')
    })
  }, [session])

  useEffect(() => {
    async function loadEntries() {
      setLoading(true)
      setError('')
      const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).toISOString().slice(0, 10)
      const { data, error: queryError } = await supabase
        .from('financial_entries')
        .select('id, entry_date, type, description, category, value, document_id')
        .gte('entry_date', firstDay)
        .lte('entry_date', lastDay)
        .order('entry_date', { ascending: true })
        .order('created_at', { ascending: true })

      if (queryError) setError(queryError.message)
      setEntries((data as FinancialEntry[]) || [])
      setLoading(false)
    }

    loadEntries().catch((loadError: Error) => {
      setError(loadError.message)
      setLoading(false)
    })
  }, [month, year])

  async function extractPdfText(file: File) {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
    const pages: string[] = []
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      const items = content.items
        .filter(item => 'str' in item)
        .map(item => ({ text: item.str, x: item.transform[4], y: item.transform[5] }))
        .sort((left, right) => right.y - left.y || left.x - right.x)
      const lines: { y: number, items: { text: string, x: number }[] }[] = []
      items.forEach(item => {
        const line = lines.find(candidate => Math.abs(candidate.y - item.y) < 2)
        if (line) line.items.push({ text: item.text, x: item.x })
        else lines.push({ y: item.y, items: [{ text: item.text, x: item.x }] })
      })
      pages.push(lines.map(line => line.items.sort((left, right) => left.x - right.x).map(item => item.text).join(' ')).join('\n'))
    }
    return pages.join('\n')
  }

  function parseFinancialEntries(text: string) {
    let currentType: 'Entrada' | 'Saída' | null = null
    let category = 'Importado do relatório'
    const parsed: ParsedEntry[] = []
    text.split('\n').forEach(rawLine => {
      const line = rawLine.replace(/\s+/g, ' ').trim()
      if (!line) return
      if (/^resumo financeiro/i.test(line)) {
        currentType = null
        return
      }
      if (/^receitas?$/i.test(line) || /^receitas? /i.test(line)) {
        currentType = 'Entrada'
        category = line
        return
      }
      if (/^despesas?$/i.test(line) || /^despesas? /i.test(line)) {
        currentType = 'Saída'
        category = line
        return
      }
      const amountMatch = line.match(/(-?\d{1,3}(?:\.\d{3})*,\d{2})$/)
      if (!currentType || !amountMatch || /^total\b/i.test(line) || /^saldo\b/i.test(line) || /^mov\./i.test(line)) return
      const description = line.slice(0, amountMatch.index).replace(/[-:]+$/, '').trim()
      if (!description || /^(receita|despesa|fundos|resumo financeiro)/i.test(description)) return
      const amount = Number(amountMatch[1].replace(/\./g, '').replace(',', '.'))
      if (!Number.isFinite(amount) || amount === 0) return
      parsed.push({ type: amount < 0 ? (currentType === 'Entrada' ? 'Saída' : 'Entrada') : currentType, description, category, value: Math.abs(amount) })
    })
    return parsed
  }

  function safeStorageFileName(fileName: string) {
    const extension = fileName.toLowerCase().endsWith('.pdf') ? '.pdf' : ''
    const baseName = extension ? fileName.slice(0, -4) : fileName
    const safeBaseName = baseName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    return `${safeBaseName || 'prestacao-de-contas'}${extension}`
  }

  async function importPdf(event: React.FormEvent) {
    event.preventDefault()
    if (!pdfFile || !session?.user) return
    setImporting(true)
    setError('')
    setImportStatus('Lendo o PDF...')
    try {
      const text = await extractPdfText(pdfFile)
      const detectedEntries = parseFinancialEntries(text)
      const storagePath = `${session.user.id}/${year}-${String(month).padStart(2, '0')}-${Date.now()}-${safeStorageFileName(pdfFile.name)}`
      const upload = await supabase.storage.from('financial-documents').upload(storagePath, pdfFile, { contentType: 'application/pdf', upsert: false })
      if (upload.error) throw upload.error
      const documentResult = await supabase.from('financial_documents').insert({
        file_name: pdfFile.name,
        storage_path: storagePath,
        reference_month: month,
        reference_year: year,
        status: 'REVIEW',
        extracted_text: text,
        uploaded_by: session.user.id
      }).select('id').single()
      if (documentResult.error) throw documentResult.error
      setDocumentId(documentResult.data.id)
      setExtractedText(text)
      setParsedEntries(detectedEntries)
      setPdfFile(null)
      setImportStatus('PDF carregado. Revise o conteúdo e cadastre os lançamentos abaixo.')
    } catch (importError: any) {
      const message = importError?.message || 'Não foi possível processar o PDF.'
      setError(message.includes('Bucket not found')
        ? 'O armazenamento dos documentos ainda não foi configurado. Execute o comando de migração do Supabase e tente novamente.'
        : message)
      setImportStatus('')
    } finally {
      setImporting(false)
    }
  }

  async function confirmImport() {
    if (!documentId || !session?.user || parsedEntries.length === 0) return
    setImporting(true)
    setError('')
    const payload = parsedEntries.map(entry => ({
      ...entry,
      entry_date: `${year}-${String(month).padStart(2, '0')}-01`,
      created_by: session.user.id,
      document_id: documentId
    }))
    const result = await supabase.from('financial_entries').insert(payload).select('id, entry_date, type, description, category, value, document_id')
    if (result.error) {
      setError(result.error.message)
    } else {
      await supabase.from('financial_documents').update({ status: 'IMPORTED' }).eq('id', documentId)
      setEntries(current => [...current, ...(result.data as FinancialEntry[])])
      setParsedEntries([])
      setImportStatus('Importação confirmada e lançamentos adicionados ao período.')
    }
    setImporting(false)
  }

  const totals = useMemo(() => entries.reduce((result, entry) => {
    result[entry.type] += Number(entry.value)
    return result
  }, { Entrada: 0, Saída: 0 }), [entries])

  function resetForm() {
    setDescription('')
    setCategory('')
    setType('Entrada')
    setValue('')
    setEditingId(null)
    setEditingDocumentId(null)
  }

  function editEntry(entry: FinancialEntry) {
    setEditingId(entry.id)
    setDescription(entry.description)
    setCategory(entry.category)
    setType(entry.type)
    setValue(String(entry.value))
    setEditingDocumentId(entry.document_id || null)
    setImportStatus('Editando registro. Altere os campos e salve as alterações.')
    window.setTimeout(() => {
      document.getElementById('financial-entry-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      document.getElementById('entry-description')?.focus()
    }, 0)
  }

  async function saveEntry(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    const numericValue = Number(value.replace(',', '.'))
    if (!description.trim() || !category.trim() || !Number.isFinite(numericValue) || numericValue < 0) {
      setError('Preencha descrição, categoria e um valor válido.')
      return
    }

    setSaving(true)
    try {
      const entryDate = `${year}-${String(month).padStart(2, '0')}-01`
      const payload = { entry_date: entryDate, type, description: description.trim(), category: category.trim(), value: numericValue, created_by: session?.user.id, document_id: editingId ? editingDocumentId : documentId }
      const result = editingId
        ? await supabase.from('financial_entries').update(payload).eq('id', editingId).select('id, entry_date, type, description, category, value, document_id').single()
        : await supabase.from('financial_entries').insert(payload).select('id, entry_date, type, description, category, value, document_id').single()

      if (result.error) {
        setError(result.error.message)
      } else if (editingId) {
        setEntries(current => current.map(entry => entry.id === editingId ? result.data as FinancialEntry : entry))
        setImportStatus('Lançamento atualizado com sucesso.')
        resetForm()
      } else {
        setEntries(current => [...current, result.data as FinancialEntry])
        setImportStatus('Lançamento adicionado com sucesso.')
        resetForm()
      }
    } catch (saveError: any) {
      setError(saveError?.message || 'Não foi possível salvar o lançamento.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteEntry(id: number) {
    setError('')
    const { error: deleteError } = await supabase.from('financial_entries').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setEntries(current => current.filter(entry => entry.id !== id))
    if (editingId === id) resetForm()
  }

  async function deleteAllForPeriod() {
    const periodName = `${monthNames[month - 1]} de ${year}`
    if (!window.confirm(`Excluir todos os lançamentos e PDFs de ${periodName}? Esta ação não pode ser desfeita.`)) return

    setDeletingAll(true)
    setError('')
    setImportStatus('Excluindo registros do período...')
    try {
      const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).toISOString().slice(0, 10)
      const documentsResult = await supabase
        .from('financial_documents')
        .select('id, storage_path')
        .eq('reference_month', month)
        .eq('reference_year', year)
      if (documentsResult.error) throw documentsResult.error

      const storagePaths = (documentsResult.data || []).map(document => document.storage_path)
      if (storagePaths.length > 0) {
        const storageResult = await supabase.storage.from('financial-documents').remove(storagePaths)
        if (storageResult.error) throw storageResult.error
      }

      const entriesResult = await supabase.from('financial_entries').delete().gte('entry_date', firstDay).lte('entry_date', lastDay)
      if (entriesResult.error) throw entriesResult.error
      const documentsDeleteResult = await supabase.from('financial_documents').delete().eq('reference_month', month).eq('reference_year', year)
      if (documentsDeleteResult.error) throw documentsDeleteResult.error

      setEntries([])
      setDocumentId(null)
      setParsedEntries([])
      setExtractedText('')
      setImportStatus(`Todos os registros de ${periodName} foram excluídos.`)
      resetForm()
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Não foi possível excluir os registros do período.')
      setImportStatus('')
    } finally {
      setDeletingAll(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="site-root">
      <Header />
      <main className="transparency-shell container">
        <div className="dashboard-header">
          <div>
            <span className="dashboard-kicker">Acesso restrito a moradores</span>
            <h1>Portal da Transparência</h1>
            <p>Consulte e acompanhe as movimentações financeiras do condomínio.</p>
          </div>
          <button className="dashboard-logout" type="button" onClick={handleLogout}>Sair</button>
        </div>

        {canManage && <section className="transparency-section transparency-import">
          <div className="section-heading"><div><span className="section-label">Prestação de contas</span><h2>Importar PDF mensal</h2></div></div>
          <p className="section-note">O arquivo original será preservado. A leitura fica em revisão até que os lançamentos sejam conferidos.</p>
          <form className="transparency-import-form" onSubmit={importPdf}>
            <div><label htmlFor="financial-pdf">Arquivo PDF</label><input id="financial-pdf" type="file" accept="application/pdf" onChange={event => setPdfFile(event.target.files?.[0] || null)} required /></div>
            <button type="submit" disabled={!pdfFile || importing}>{importing ? 'Processando...' : 'Carregar e ler PDF'}</button>
          </form>
          {importStatus && <div className="success">{importStatus}</div>}
          {parsedEntries.length > 0 && <div className="import-review">
            <strong>{parsedEntries.length} lançamentos detectados</strong>
            <div className="transparency-table-wrap"><table className="transparency-table"><thead><tr><th>Tipo</th><th>Descrição</th><th>Categoria</th><th>Valor</th></tr></thead><tbody>{parsedEntries.map((entry, index) => <tr key={`${entry.description}-${index}`}><td>{entry.type}</td><td>{entry.description}</td><td>{entry.category}</td><td>{formatCurrency(entry.value)}</td></tr>)}</tbody></table></div>
            <button type="button" onClick={confirmImport} disabled={importing}>Confirmar lançamentos detectados</button>
          </div>}
          {extractedText && <details className="extracted-text"><summary>Ver texto extraído do documento</summary><pre>{extractedText}</pre></details>}
        </section>}

        <section className="transparency-period" aria-label="Período da consulta">
          <div>
            <label htmlFor="transparency-month">Mês</label>
            <select id="transparency-month" value={month} onChange={event => setMonth(Number(event.target.value))}>
              {monthNames.map((name, index) => <option value={index + 1} key={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="transparency-year">Ano</label>
            <select id="transparency-year" value={year} onChange={event => setYear(Number(event.target.value))}>
              {Array.from({ length: 7 }, (_, index) => currentDate.getFullYear() - 3 + index).map(optionYear => <option value={optionYear} key={optionYear}>{optionYear}</option>)}
            </select>
          </div>
          {canManage && <button className="delete-period-button" type="button" onClick={deleteAllForPeriod} disabled={deletingAll}>{deletingAll ? 'Excluindo...' : 'Excluir tudo do período'}</button>}
        </section>

        <section className="transparency-summary" aria-label="Resumo financeiro">
          <div><span>Entradas</span><strong className="amount-positive">{formatCurrency(totals.Entrada)}</strong></div>
          <div><span>Saídas</span><strong className="amount-negative">{formatCurrency(totals.Saída)}</strong></div>
          <div className="transparency-total"><span>Total do mês</span><strong>{formatCurrency(totals.Entrada - totals.Saída)}</strong></div>
        </section>

        <section className="transparency-section" id="financial-entry-form">
          <div className="section-heading"><div><span className="section-label">Lançamento financeiro</span><h2>{editingId ? 'Editar registro' : 'Adicionar registro'}</h2></div></div>
          <form className="transparency-form" onSubmit={saveEntry}>
            <div><label htmlFor="entry-type">Tipo</label><select id="entry-type" value={type} onChange={event => setType(event.target.value as 'Entrada' | 'Saída')}><option>Entrada</option><option>Saída</option></select></div>
            <div><label htmlFor="entry-description">Descrição</label><input id="entry-description" value={description} onChange={event => setDescription(event.target.value)} placeholder="Ex.: Taxa condominial" required /></div>
            <div><label htmlFor="entry-category">Categoria</label><input id="entry-category" value={category} onChange={event => setCategory(event.target.value)} placeholder="Ex.: Manutenção" required /></div>
            <div><label htmlFor="entry-value">Valor</label><input id="entry-value" value={value} onChange={event => setValue(event.target.value)} type="text" inputMode="decimal" placeholder="0,00" required /></div>
            {canManage && <div className="transparency-form-actions"><button type="submit" disabled={saving}>{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Adicionar registro'}</button>{editingId && <button className="button-secondary" type="button" onClick={resetForm}>Cancelar</button>}</div>}
          </form>
        </section>

        {error && <div className="error" role="alert">{error}</div>}
        <section className="transparency-section">
          <div className="section-heading"><div><span className="section-label">Movimentações de {monthNames[month - 1]} de {year}</span><h2>Registros do período</h2></div><span className="section-count">{entries.length} {entries.length === 1 ? 'registro' : 'registros'}</span></div>
          <div className="transparency-table-wrap">
            <table className="transparency-table">
              <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Entradas</th><th>Saídas</th><th aria-label="Ações"></th></tr></thead>
              <tbody>
                {!loading && entries.length === 0 && <tr><td className="table-empty" colSpan={6}>Nenhum registro encontrado neste período.</td></tr>}
                {loading && <tr><td className="table-empty" colSpan={6}>Carregando registros...</td></tr>}
                {entries.map(entry => <tr key={entry.id}><td>{new Date(`${entry.entry_date}T12:00:00`).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}</td><td><strong>{entry.description}</strong></td><td>{entry.category}</td><td className="amount-positive">{entry.type === 'Entrada' ? formatCurrency(Number(entry.value)) : '-'}</td><td className="amount-negative">{entry.type === 'Saída' ? formatCurrency(Number(entry.value)) : '-'}</td><td className="table-actions">{canManage && <><button type="button" onClick={() => editEntry(entry)}>Editar</button><button type="button" onClick={() => deleteEntry(entry.id)}>Excluir</button></>}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}