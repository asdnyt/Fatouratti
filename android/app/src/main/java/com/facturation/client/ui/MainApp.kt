package com.facturation.client.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.facturation.client.data.model.Client
import com.facturation.client.ui.screens.ClientHistoryScreen
import com.facturation.client.ui.screens.ClientsScreen
import com.facturation.client.ui.screens.InvoiceScreen
import com.facturation.client.ui.screens.SituationScreen

enum class NavItem(val title: String, val icon: ImageVector) {
    CLIENTS("Clients", Icons.Default.People),
    FACTURES("Factures", Icons.Default.Receipt),
    SITUATION("Situation", Icons.Default.Assessment)
}

@Composable
fun MainApp(viewModel: MainViewModel) {
    var currentTab by remember { mutableStateOf(NavItem.CLIENTS) }
    var viewingClientHistory by remember { mutableStateOf<Long?>(null) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavItem.values().forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) },
                        selected = currentTab == item && viewingClientHistory == null,
                        onClick = {
                            viewingClientHistory = null
                            currentTab = item
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        Surface(modifier = Modifier.padding(innerPadding)) {
            when {
                viewingClientHistory != null -> {
                    ClientHistoryScreen(
                        clientId = viewingClientHistory!!,
                        viewModel = viewModel,
                        onBack = { viewingClientHistory = null }
                    )
                }
                currentTab == NavItem.CLIENTS -> {
                    ClientsScreen(
                        viewModel = viewModel,
                        onClientClick = { clientWithBalance ->
                            viewModel.selectClient(
                                Client(
                                    id = clientWithBalance.id,
                                    name = clientWithBalance.name,
                                    phone = clientWithBalance.phone,
                                    address = clientWithBalance.address
                                )
                            )
                            currentTab = NavItem.FACTURES
                        }
                    )
                }
                currentTab == NavItem.FACTURES -> {
                    InvoiceScreen(
                        viewModel = viewModel,
                        onInvoiceSaved = {
                            currentTab = NavItem.SITUATION
                        }
                    )
                }
                currentTab == NavItem.SITUATION -> {
                    SituationScreen(
                        viewModel = viewModel,
                        onSelectClientForHistory = { clientId ->
                            viewingClientHistory = clientId
                        }
                    )
                }
            }
        }
    }
}
