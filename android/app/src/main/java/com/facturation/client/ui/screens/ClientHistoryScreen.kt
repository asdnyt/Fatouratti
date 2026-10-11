package com.facturation.client.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.facturation.client.data.model.Invoice
import com.facturation.client.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClientHistoryScreen(
    clientId: Long,
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val invoicesFlow = remember(clientId) { viewModel.getInvoicesForClient(clientId) }
    val invoices by invoicesFlow.collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Historique des Factures", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Retour")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF1E293B),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp)
        ) {
            if (invoices.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize()) {
                    Text("Aucune facture pour ce client.", color = Color.Gray)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(invoices) { inv ->
                        InvoiceHistoryCard(invoice = inv)
                    }
                }
            }
        }
    }
}

@Composable
fun InvoiceHistoryCard(invoice: Invoice) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(invoice.invoiceNumber, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Text(invoice.date, fontSize = 12.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Total", fontSize = 11.sp, color = Color.Gray)
                    Text("%.2f €".format(invoice.totalAmount), fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                }
                Column {
                    Text("Payé", fontSize = 11.sp, color = Color.Gray)
                    Text("%.2f €".format(invoice.paidAmount), fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = Color(0xFF059669))
                }
                Column {
                    Text("Reste", fontSize = 11.sp, color = Color.Gray)
                    Text(
                        "%.2f €".format(invoice.remainingAmount),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = if (invoice.remainingAmount > 0) Color(0xFFDC2626) else Color(0xFF16A34A)
                    )
                }
            }
        }
    }
}
