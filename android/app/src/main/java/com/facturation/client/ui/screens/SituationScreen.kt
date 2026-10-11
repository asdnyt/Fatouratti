package com.facturation.client.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.facturation.client.data.local.ClientFinancialSummary
import com.facturation.client.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SituationScreen(
    viewModel: MainViewModel,
    onSelectClientForHistory: (Long) -> Unit
) {
    val summaries by viewModel.financialSummaries.collectAsState()

    val totalVentes = summaries.sumOf { it.totalSales }
    val totalPaye = summaries.sumOf { it.totalPaid }
    val totalRestant = summaries.sumOf { it.totalRemaining }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Situation Financière", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF7C3AED),
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
            // SYNTHÈSE GLOBALE
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF3E8FF))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Vue globale de l'entreprise", fontWeight = FontWeight.Bold, color = Color(0xFF6B21A8))
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Total des Ventes", fontSize = 12.sp, color = Color.Gray)
                            Text("%.2f €".format(totalVentes), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1E293B))
                        }
                        Column {
                            Text("Total Encaissé", fontSize = 12.sp, color = Color.Gray)
                            Text("%.2f €".format(totalPaye), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF059669))
                        }
                        Column {
                            Text("Reste à Recouvrer", fontSize = 12.sp, color = Color.Gray)
                            Text("%.2f €".format(totalRestant), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFFDC2626))
                        }
                    }
                }
            }

            Text(
                "Situation par client (cliquer pour l'historique)",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
            )

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(summaries) { item ->
                    ClientSituationCard(item = item, onClick = { onSelectClientForHistory(item.clientId) })
                }
            }
        }
    }
}

@Composable
fun ClientSituationCard(item: ClientFinancialSummary, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(item.clientName, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("${item.invoiceCount} facture(s)", fontSize = 12.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Ventes", fontSize = 11.sp, color = Color.Gray)
                    Text("%.2f €".format(item.totalSales), fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                }
                Column {
                    Text("Payé", fontSize = 11.sp, color = Color.Gray)
                    Text("%.2f €".format(item.totalPaid), fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = Color(0xFF059669))
                }
                Column {
                    Text("Reste dû", fontSize = 11.sp, color = Color.Gray)
                    Text("%.2f €".format(item.totalRemaining), fontWeight = FontWeight.Bold, fontSize = 14.sp, color = if (item.totalRemaining > 0) Color(0xFFDC2626) else Color(0xFF16A34A))
                }
            }
        }
    }
}
