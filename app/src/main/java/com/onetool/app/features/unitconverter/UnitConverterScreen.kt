package com.onetool.app.features.unitconverter

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun UnitConverterScreen(
    vm: UnitConverterViewModel = viewModel()
) {
    val ctx = LocalContext.current

    val input by vm.input.collectAsState()
    val from by vm.fromUnit.collectAsState()
    val to by vm.toUnit.collectAsState()
    val result by vm.result.collectAsState()
    val precision by vm.precision.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Unit Converter") },
                actions = {
                    TextButton(onClick = vm::reset) {
                        Text("Reset", color = MaterialTheme.colors.onPrimary)
                    }
                }
            )
        }
    ) { pad ->
        Column(
            modifier = Modifier
                .padding(pad)
                .padding(16.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {

            OutlinedTextField(
                value = input,
                onValueChange = vm::onInputChange,
                label = { Text("Input value") },
                modifier = Modifier.fillMaxWidth()
            )

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                unitDrop("From", from, vm.units, vm::onFromUnitChange, Modifier.weight(1f))
                Button(onClick = vm::swapUnits) { Text("↔") }
                unitDrop("To", to, vm.units, vm::onToUnitChange, Modifier.weight(1f))
            }

            Text("Precision: $precision")
            Slider(
                value = precision.toFloat(),
                onValueChange = { vm.onPrecisionChange(it.toInt()) },
                valueRange = 0f..5f,
                steps = 4
            )

            if (result.isNotEmpty()) {
                Card {
                    Column(Modifier.padding(16.dp)) {
                        Text("Result")
                        Text(result, style = MaterialTheme.typography.h6)
                        Button(onClick = { copy(ctx, result) }) {
                            Text("Copy")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun unitDrop(
    label: String,
    value: String,
    options: List<String>,
    onPick: (String) -> Unit,
    modifier: Modifier
) {
    var open by remember { mutableStateOf(false) }
    Column(modifier) {
        Text(label)
        OutlinedTextField(
            value = value,
            onValueChange = {},
            readOnly = true,
            modifier = Modifier
                .fillMaxWidth()
                .clickable { open = true }
        )
        DropdownMenu(open, { open = false }) {
            options.forEach {
                DropdownMenuItem(onClick = {
                    onPick(it)
                    open = false
                }) { Text(it) }
            }
        }
    }
}

private fun copy(ctx: Context, text: String) {
    val cm = ctx.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    cm.setPrimaryClip(ClipData.newPlainText("result", text))
}
