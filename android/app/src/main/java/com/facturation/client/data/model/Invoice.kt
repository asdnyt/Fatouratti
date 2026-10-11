package com.facturation.client.data.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "invoices",
    foreignKeys = [
        ForeignKey(
            entity = Client::class,
            parentColumns = ["id"],
            childColumns = ["clientId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("clientId")]
)
data class Invoice(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val invoiceNumber: String,
    val clientId: Long,
    val clientName: String,
    val date: String,
    val totalAmount: Double,
    val paidAmount: Double,
    val remainingAmount: Double = (totalAmount - paidAmount).coerceAtLeast(0.0),
    val notes: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
