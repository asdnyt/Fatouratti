package com.facturation.client.data.local

import androidx.room.*
import com.facturation.client.data.model.Invoice
import com.facturation.client.data.model.InvoiceItem
import kotlinx.coroutines.flow.Flow

data class ClientFinancialSummary(
    val clientId: Long,
    val clientName: String,
    val clientPhone: String,
    val invoiceCount: Int,
    val totalSales: Double,
    val totalPaid: Double,
    val totalRemaining: Double
)

@Dao
interface InvoiceDao {
    @Query("SELECT * FROM invoices ORDER BY id DESC")
    fun getAllInvoices(): Flow<List<Invoice>>

    @Query("SELECT * FROM invoices WHERE clientId = :clientId ORDER BY id DESC")
    fun getInvoicesForClient(clientId: Long): Flow<List<Invoice>>

    @Query("SELECT * FROM invoice_items WHERE invoiceId = :invoiceId")
    suspend fun getItemsForInvoice(invoiceId: Long): List<InvoiceItem>

    @Query("""
        SELECT c.id as clientId, c.name as clientName, c.phone as clientPhone,
               COUNT(i.id) as invoiceCount,
               COALESCE(SUM(i.totalAmount), 0.0) as totalSales,
               COALESCE(SUM(i.paidAmount), 0.0) as totalPaid,
               COALESCE(SUM(i.totalAmount - i.paidAmount), 0.0) as totalRemaining
        FROM clients c
        LEFT JOIN invoices i ON c.id = i.clientId
        GROUP BY c.id
        ORDER BY totalRemaining DESC, c.name ASC
    """)
    fun getFinancialSummaries(): Flow<List<ClientFinancialSummary>>

    @Insert
    suspend fun insertInvoice(invoice: Invoice): Long

    @Insert
    suspend fun insertInvoiceItems(items: List<InvoiceItem>)

    @Transaction
    suspend fun insertCompleteInvoice(invoice: Invoice, items: List<InvoiceItem>): Long {
        val invoiceId = insertInvoice(invoice)
        val linkedItems = items.map { it.copy(invoiceId = invoiceId) }
        insertInvoiceItems(linkedItems)
        return invoiceId
    }

    @Query("UPDATE invoices SET paidAmount = :newPaid, remainingAmount = :newRemaining WHERE id = :invoiceId")
    suspend fun updatePayment(invoiceId: Long, newPaid: Double, newRemaining: Double)

    @Delete
    suspend fun deleteInvoice(invoice: Invoice)
}
