'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Download, CheckCircle2, MessageCircle } from 'lucide-react'
import { useRef } from 'react'
import type { CartItem } from '@/store/cart-store'

type Props = {
  open: boolean
  onClose: () => void
  orderNumber: string
  orderDate: Date
  customerName: string
  customerPhone: string
  customerAddress: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
}

export function Receipt({
  open,
  onClose,
  orderNumber,
  orderDate,
  customerName,
  customerPhone,
  customerAddress,
  items,
  subtotal,
  deliveryFee,
  discount,
  total,
}: Props) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handleSave = async () => {
    if (!receiptRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `cupom-spaghetti-expresso-${orderNumber}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Error generating receipt image:', err)
    }
  }

  const handleWhatsAppPayment = async () => {
    if (!receiptRef.current) return

    const message = `Olá! Acabei de realizar o pedido #${orderNumber}. Gostaria de receber as informações de pagamento.\n\nTotal: ${formatCurrency(total)}`
    const whatsappUrl = `https://wa.me/5573991254234?text=${encodeURIComponent(message)}`

    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      })

      canvas.toBlob(async (blob) => {
        if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'comanda.png', { type: 'image/png' })] })) {
          const file = new File([blob], `comanda-${orderNumber}.png`, { type: 'image/png' })
          try {
            await navigator.share({
              files: [file],
              title: `Pedido #${orderNumber}`,
              text: message,
            })
          } catch (shareErr) {
            // Se o compartilhamento for cancelado ou falhar, abre o link direto
            console.log('Share was cancelled or failed', shareErr)
            window.open(whatsappUrl, '_blank')
          }
        } else {
          // Fallback para link direto se não houver suporte a compartilhamento de arquivos
          window.open(whatsappUrl, '_blank')
        }
      }, 'image/png')
    } catch (err) {
      console.error('Error in WhatsApp payment flow:', err)
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm sm:max-w-md p-2 sm:p-4 max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Cupom Fiscal</DialogTitle>

        {/* Success Message */}
        <div className="flex flex-col items-center gap-2 py-3">
          <CheckCircle2 className="h-12 w-12 text-success animate-bounce-subtle" />
          <h2 className="text-xl font-bold text-success">Pedido Realizado com Sucesso!</h2>
        </div>

        {/* Receipt */}
        <div ref={receiptRef} className="receipt-container">
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
            <div className="text-xl font-bold">SPAGHETTI EXPRESSO</div>
            <div className="text-xs mt-1">Delivery Artesanal</div>
            <div className="text-xs mt-2">{formatDate(orderDate)}</div>
            <div className="text-xs font-bold mt-1">PEDIDO #{orderNumber}</div>
          </div>

          {/* Customer Info */}
          <div className="border-b-2 border-dashed border-gray-400 pb-3 mb-3 text-xs">
            <div><strong>Cliente:</strong> {customerName}</div>
            <div><strong>Tel:</strong> {customerPhone}</div>
            <div><strong>End:</strong> {customerAddress}</div>
          </div>

          {/* Items Header */}
          <div className="flex text-xs font-bold border-b border-gray-300 pb-1 mb-2">
            <span className="w-8">QTD</span>
            <span className="flex-1">PRODUTO</span>
            <span className="w-20 text-right">PREÇO</span>
          </div>

          {/* Items */}
          <div className="space-y-2 border-b-2 border-dashed border-gray-400 pb-3 mb-3">
            {items.map((item, idx) => (
              <div key={idx}>
                <div className="flex text-xs">
                  <span className="w-8">{item.quantity}x</span>
                  <span className="flex-1">{item.name}</span>
                  <span className="w-20 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
                {item.removed_ingredients.length > 0 && (
                  <div className="text-[10px] text-gray-500 ml-8 mt-0.5">
                    Sem: {item.removed_ingredients.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de Entrega:</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-2 mt-2">
              <span>TOTAL:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-gray-500 mt-4 pt-3 border-t-2 border-dashed border-gray-400">
            <div>Obrigado pela preferência!</div>
            <div>SPAGHETTI EXPRESSO - Delivery Artesanal</div>
            <div className="mt-1">*** CUPOM NÃO FISCAL ***</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleWhatsAppPayment} 
            className="w-full gap-3 bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg shadow-xl animate-pulse-gold rounded-xl"
          >
            <MessageCircle className="h-6 w-6" />
            Realizar Pagamento
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
            <Button variant="ghost" onClick={handleSave} className="flex-1 gap-2 text-muted-foreground text-xs">
              <Download className="h-3 w-3" />
              Salvar Comprovante
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
