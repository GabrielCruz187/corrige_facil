'use client'

import { forwardRef } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'

interface Questao {
  numero: number
  tipo: 'objetiva' | 'dissertativa'
  enunciado: string
  alternativas?: {
    A: string
    B: string
    C: string
    D: string
    E: string
  }
  gabarito?: string
  criterios_correcao?: string
  pontuacao: number
  imagem_url?: string
}

interface ProvaPreviewPrintProps {
  titulo: string
  disciplina: string
  questoes: Questao[]
  mostrarGabarito?: boolean
  mostrarPontuacao?: boolean
}

export const ProvaPreviewPrint = forwardRef<
  HTMLDivElement,
  ProvaPreviewPrintProps
>(
  (
    {
      titulo,
      disciplina,
      questoes,
      mostrarGabarito = false,
      mostrarPontuacao = true,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="w-full bg-white p-8 font-serif text-black"
        style={{
          fontFamily: 'Georgia, serif',
          lineHeight: '1.6',
          color: '#000',
        }}
      >
        {/* Cabeçalho */}
        <div className="mb-8 border-b-2 border-black pb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">{titulo}</h1>
          <p className="text-lg font-semibold text-gray-700">{disciplina}</p>
          <p className="text-sm text-gray-600 mt-2">
            Data: _________________ | Nome: _________________________________
          </p>
        </div>

        {/* Instruções */}
        <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded">
          <p className="text-sm font-semibold mb-2">Instruções:</p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• Leia atentamente cada questão antes de responder</li>
            <li>• Para questões objetivas, marque apenas uma alternativa</li>
            <li>• Utilize caneta azul ou preta para as respostas</li>
            {mostrarPontuacao && <li>• Cada questão vale sua pontuação indicada</li>}
          </ul>
        </div>

        {/* Questões */}
        <div className="space-y-8">
          {questoes.map((questao) => (
            <div key={questao.numero} className="break-inside-avoid page-break-inside-avoid">
              {/* Número e Tipo */}
              <div className="flex items-start gap-4 mb-3">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black text-white font-bold text-sm">
                    {questao.numero}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded">
                      {questao.tipo === 'objetiva' ? 'Objetiva' : 'Dissertativa'}
                    </span>
                    {mostrarPontuacao && (
                      <span className="text-xs text-gray-600">
                        ({questao.pontuacao} {questao.pontuacao === 1 ? 'ponto' : 'pontos'})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Enunciado */}
              <div className="ml-12 mb-4">
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {questao.enunciado}
                </p>
              </div>

              {/* Imagem */}
              {questao.imagem_url && (
                <div className="ml-12 mb-4">
                  <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded border border-gray-300 max-w-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={questao.imagem_url}
                      alt={`Questão ${questao.numero}`}
                      className="w-full h-full object-cover rounded"
                      style={{
                        maxHeight: '300px',
                        objectFit: 'contain',
                      }}
                    />
                  </AspectRatio>
                </div>
              )}

              {/* Conteúdo específico por tipo */}
              <div className="ml-12">
                {questao.tipo === 'objetiva' && questao.alternativas && (
                  <div className="space-y-2 mb-6">
                    {Object.entries(questao.alternativas).map(([letra, texto]) => (
                      <div key={letra} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 border-2 border-black rounded-sm flex items-center justify-center">
                          <span className="font-bold text-sm">{letra}</span>
                        </div>
                        <p className="text-base leading-relaxed flex-grow">
                          {texto}
                          {mostrarGabarito && letra === questao.gabarito && (
                            <span className="ml-3 font-bold text-red-600">[GABARITO]</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {questao.tipo === 'dissertativa' && (
                  <div className="space-y-3 mb-6">
                    {/* Linhas para resposta */}
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="border-b border-gray-400"
                          style={{ height: '1.5rem' }}
                        />
                      ))}
                    </div>

                    {/* Critérios */}
                    {questao.criterios_correcao && mostrarGabarito && (
                      <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                        <p className="font-semibold text-gray-700 mb-1">Critérios de Correção:</p>
                        <p className="text-gray-700 text-xs whitespace-pre-wrap">
                          {questao.criterios_correcao}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Separador */}
              {questao.numero < questoes.length && (
                <div className="border-t border-gray-300 mt-6 pt-6" />
              )}
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div className="mt-12 pt-6 border-t-2 border-black text-center text-xs text-gray-600">
          <p>Prova gerada automaticamente | Total de questões: {questoes.length}</p>
        </div>

        {/* Estilos de Impressão */}
        <style>{`
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            
            .page-break-inside-avoid {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            img {
              max-width: 100%;
              height: auto;
            }
            
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    )
  }
)

ProvaPreviewPrint.displayName = 'ProvaPreviewPrint'
