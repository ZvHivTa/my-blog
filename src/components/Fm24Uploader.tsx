import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadCloud, FileJson, Loader2 } from 'lucide-react'

export default function Fm24Uploader() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('教练，请先选择一份 XML 报告！')
      return
    }

    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      // 【重要】换成你 Spring Boot 实际的接口地址
      const response = await fetch('http://localhost:8080/api/xml-to-json', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error('解析失败:', err)
      setError('解析失败！请检查后端是否启动，以及 CORS 是否配置正确。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 mt-8">
      {/* 军情上传区 */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col space-y-1.5 mb-6">
          <h3 className="font-semibold leading-none tracking-tight text-xl">导入球探/战术报告 (XML)</h3>
          <p className="text-sm text-muted-foreground">
            上传 FM24 导出的 XML 文件，Spring Boot 将自动解析为结构化数据。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input 
              id="xml-upload" 
              type="file" 
              accept=".xml" 
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
          <Button 
            onClick={handleUpload} 
            disabled={!file || loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                解析中...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                开始解析
              </>
            )}
          </Button>
        </div>
        
        {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
      </div>

      {/* 军情展示区 */}
      {result && (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              JSON 数据预览
            </h3>
            <span className="text-xs text-muted-foreground">数据已就绪，等待注入图表</span>
          </div>
          <pre className="max-h-[500px] overflow-auto rounded-lg bg-muted p-4 text-xs">
            <code>{JSON.stringify(result, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  )
}