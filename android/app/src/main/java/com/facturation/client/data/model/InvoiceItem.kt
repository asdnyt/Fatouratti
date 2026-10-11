package com.facturation.client.data.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "invoice_items",
    foreignKeys = [
        ForeignKey(
            entity = Invoice::class,
            parentColumns = ["id"],
            childColumns = ["invoiceId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("invoiceId")]
)
data class InvoiceItem(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val invoiceId: Long = 0,
    val designation: String,
    val quantity: Double,
    val unitPrice: Double,
    val total: Double = quantity * unitPrice
)
