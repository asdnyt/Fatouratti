package com.facturation.client.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.facturation.client.data.local.ClientDao
import com.facturation.client.data.local.ClientWithBalance
import com.facturation.client.data.local.InvoiceDao
import com.facturation.client.data.local.ClientFinancialSummary
import com.facturation.client.data.model.Client
import com.facturation.client.data.model.Invoice
import com.facturation.client.data.model.InvoiceItem
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class MainViewModel(
    private val clientDao: ClientDao,
    private val invoiceDao: InvoiceDao
) : ViewModel() {

    val clientsWithBalance: StateFlow<List<ClientWithBalance>> = clientDao.getClientsWithBalance()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val financialSummaries: StateFlow<List<ClientFinancialSummary>> = invoiceDao.getFinancialSummaries()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selectedClient = MutableStateFlow<Client?>(null)
    val selectedClient: StateFlow<Client?> = _selectedClient.asStateFlow()

    fun selectClient(client: Client) {
        _selectedClient.value = client
    }

    fun addClient(name: String, phone: String, address: String, onComplete: (Long) -> Unit = {}) {
        viewModelScope.launch {
            val id = clientDao.insertClient(
                Client(name = name.trim(), phone = phone.trim(), address = address.trim())
            )
            onComplete(id)
        }
    }

    fun saveInvoice(
        client: Client,
        items: List<InvoiceItem>,
        paidAmount: Double,
        notes: String = "",
        onComplete: () -> Unit
    ) {
        viewModelScope.launch {
            val totalAmount = items.sumOf { it.quantity * it.unitPrice }
            val remainingAmount = (totalAmount - paidAmount).coerceAtLeast(0.0)
            val dateStr = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(Date())
            val invoiceNumber = "FACT-" + SimpleDateFormat("yyyyMMdd-HHmm", Locale.getDefault()).format(Date())

            val invoice = Invoice(
                invoiceNumber = invoiceNumber,
                clientId = client.id,
                clientName = client.name,
                date = dateStr,
                totalAmount = totalAmount,
                paidAmount = paidAmount,
                remainingAmount = remainingAmount,
                notes = notes
            )

            invoiceDao.insertCompleteInvoice(invoice, items)
            onComplete()
        }
    }

    fun getInvoicesForClient(clientId: Long): Flow<List<Invoice>> {
        return invoiceDao.getInvoicesForClient(clientId)
    }

    fun recordPayment(invoiceId: Long, currentPaid: Double, currentTotal: Double, addedPayment: Double) {
        viewModelScope.launch {
            val newPaid = (currentPaid + addedPayment).coerceAtMost(currentTotal)
            val newRemaining = (currentTotal - newPaid).coerceAtLeast(0.0)
            invoiceDao.updatePayment(invoiceId, newPaid, newRemaining)
        }
    }
}

class MainViewModelFactory(
    private val clientDao: ClientDao,
    private val invoiceDao: InvoiceDao
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(clientDao, invoiceDao) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
