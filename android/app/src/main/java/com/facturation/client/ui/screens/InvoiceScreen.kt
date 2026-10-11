package com.facturation.client.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.facturation.client.data.model.InvoiceItem
import com.facturation.client.ui.MainViewModel

class DraftItem(
    initialDesignation: String = "",
    initialQuantity: String = "1",
    initialUnitPrice: String = ""
) {
    var designation by mutableStateOf(initialDesignation)
    var quantityStr by mutableStateOf(initialQuantity)
    var unitPriceStr by mutableStateOf(initialUnitPrice)

    val quantity: Double get() = quantityStr.toDoubleOrNull() ?: 0.0
    val unitPrice: Double get() = unitPriceStr.toDoubleOrNull() ?: 0.0
    val total: Double get() = quantity * unitPrice
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InvoiceScreen(
    viewModel: MainViewModel,
    onInvoiceSaved: () -> Unit
) {
    val selectedClient by viewModel.selectedClient.collectAsState()
    val clientsWithBalance by viewModel.clientsWithBalance.collectAsState()

    val items = remember { mutableStateListOf(DraftItem(initialDesignation = "Article 1", initialQuantity = "1", initialUnitPrice = "100")) }
    var paidAmountStr by remember { mutableStateOf("0") }
    var notes by remember { mutableStateOf("") }

    val totalGeneral = items.sumOf { it.total }
    val montantPaye = paidAmountStr.toDoubleOrNull() ?: 0.0
    val resteAPayer = (totalGeneral - montantPaye).coerceAtLeast(0.0)

    val clientName = selectedClient?.name ?: "Sélectionner un client"

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Facture - $clientName", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onSecondaryContainer
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Text("Lignes de produits", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                }

                itemsIndexed(items) { index, item ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Ligne ${index + 1}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                if (items.size > 1) {
                                    IconButton(onClick = { items.removeAt(index) }) {
                                        Icon(Icons.Default.Delete, contentDescription = "Supprimer", tint = Color.Red)
                                    }
                                }
                            }
                            OutlinedTextField(
                                value = item.designation,
                                onValueChange = { item.designation = it },
                                label = { Text("Désignation du produit") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedTextField(
                                    value = item.quantityStr,
                                    onValueChange = { item.quantityStr = it },
                                    label = { Text("Quantité") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                                OutlinedTextField(
                                    value = item.unitPriceStr,
                                    onValueChange = { item.unitPriceStr = it },
                                    label = { Text("Prix unitaire") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End
                            ) {
                                Text(
                                    text = "Total ligne: %.2f €".format(item.total),
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                }

                item {
                    Button(
                        onClick = { items.add(DraftItem()) },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Ajouter un produit")
                    }
                }

                item {
                    OutlinedTextField(
                        value = paidAmountStr,
                        onValueChange = { paidAmountStr = it },
                        label = { Text("Montant payé (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            }

            // RÉSUMÉ FINANCIER EN BAS
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Total général:", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("%.2f €".format(totalGeneral), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1E293B))
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Montant payé:", fontSize = 14.sp)
                        Text("%.2f €".format(montantPaye), fontSize = 14.sp, color = Color(0xFF059669), fontWeight = FontWeight.SemiBold)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Reste à payer:", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("%.2f €".format(resteAPayer), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFFDC2626))
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {
                            selectedClient?.let { client ->
                                val invoiceItems = items.map {
                                    InvoiceItem(
                                        designation = it.designation,
                                        quantity = it.quantity,
                                        unitPrice = it.unitPrice,
                                        total = it.total
                                    )
                                }
                                viewModel.saveInvoice(client, invoiceItems, montantPaye, notes) {
                                    onInvoiceSaved()
                                }
                            }
                        },
                        enabled = selectedClient != null && totalGeneral > 0,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                    ) {
                        Text("Enregistrer la facture", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
