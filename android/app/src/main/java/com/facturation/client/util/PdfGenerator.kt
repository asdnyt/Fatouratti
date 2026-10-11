package com.facturation.client.util

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
import com.facturation.client.data.model.Invoice
import com.facturation.client.data.model.InvoiceItem
import java.io.File
import java.io.FileOutputStream

object PdfGenerator {
    fun generateInvoicePdf(context: Context, invoice: Invoice, items: List<InvoiceItem>): File {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas = page.canvas
        val paint = Paint()

        paint.color = Color.parseColor("#2563EB")
        canvas.drawRect(0f, 0f, 595f, 55f, paint)

        paint.color = Color.WHITE
        paint.textSize = 20f
        paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText("BON DE VENTE & FACTURE", 30f, 35f, paint)

        paint.color = Color.DKGRAY
        paint.textSize = 12f
        paint.typeface = Typeface.DEFAULT
        canvas.drawText("N° Facture : ${invoice.invoiceNumber}", 30f, 85f, paint)
        canvas.drawText("Date : ${invoice.date}", 30f, 105f, paint)

        paint.color = Color.BLACK
        paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText("Client : ${invoice.clientName}", 320f, 85f, paint)
        paint.typeface = Typeface.DEFAULT
        canvas.drawText("Tél : ${invoice.clientPhone}", 320f, 105f, paint)

        paint.color = Color.parseColor("#1E293B")
        canvas.drawRect(30f, 140f, 565f, 165f, paint)
        paint.color = Color.WHITE
        paint.textSize = 10f
        paint.typeface = Typeface.DEFAULT
        canvas.drawText("DÉSIGNATION", 40f, 157f, paint)
        canvas.drawText("QTÉ", 340f, 157f, paint)
        canvas.drawText("P.U. (€)", 410f, 157f, paint)
        canvas.drawText("TOTAL (€)", 500f, 157f, paint)

        var y = 185f
        paint.color = Color.BLACK
        paint.typeface = Typeface.DEFAULT
        items.forEach { item ->
            canvas.drawText(item.designation, 40f, y, paint)
            canvas.drawText(item.quantity.toString(), 340f, y, paint)
            canvas.drawText(String.format("%.2f", item.unitPrice), 410f, y, paint)
            canvas.drawText(String.format("%.2f", item.total), 500f, y, paint)
            y += 24f
        }

        y += 20f
        paint.color = Color.parseColor("#F1F5F9")
        canvas.drawRect(300f, y, 565f, y + 85f, paint)

        paint.color = Color.BLACK
        paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText("Total Général :", 315f, y + 25f, paint)
        canvas.drawText(String.format("%.2f €", invoice.totalAmount), 480f, y + 25f, paint)

        paint.color = Color.parseColor("#059669")
        canvas.drawText("Montant Payé :", 315f, y + 48f, paint)
        canvas.drawText(String.format("%.2f €", invoice.paidAmount), 480f, y + 48f, paint)

        paint.color = Color.parseColor("#DC2626")
        canvas.drawText("Reste à Payer :", 315f, y + 70f, paint)
        canvas.drawText(String.format("%.2f €", invoice.remainingAmount), 480f, y + 70f, paint)

        pdfDocument.finishPage(page)

        val file = File(context.cacheDir, "Facture_${invoice.invoiceNumber}.pdf")
        val outputStream = FileOutputStream(file)
        pdfDocument.writeTo(outputStream)
        outputStream.close()
        pdfDocument.close()
        return file
    }

    fun sharePdf(context: Context, pdfFile: File) {
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.provider", pdfFile)
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(shareIntent, "Partager la facture"))
    }
}
