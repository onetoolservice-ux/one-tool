package com.onetool.app.features.unitconverter

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlin.math.round

class UnitConverterViewModel : ViewModel() {

    private val unitMap = mapOf(
        "cm" to 0.01,
        "m" to 1.0,
        "km" to 1000.0
    )

    val units: List<String> = unitMap.keys.toList()

    private val _input = MutableStateFlow("")
    val input: StateFlow<String> = _input

    private val _fromUnit = MutableStateFlow("cm")
    val fromUnit: StateFlow<String> = _fromUnit

    private val _toUnit = MutableStateFlow("m")
    val toUnit: StateFlow<String> = _toUnit

    private val _precision = MutableStateFlow(2)
    val precision: StateFlow<Int> = _precision

    private val _result = MutableStateFlow("")
    val result: StateFlow<String> = _result

    fun onInputChange(v: String) {
        _input.value = v
        calculate()
    }

    fun onFromUnitChange(v: String) {
        _fromUnit.value = v
        calculate()
    }

    fun onToUnitChange(v: String) {
        _toUnit.value = v
        calculate()
    }

    fun onPrecisionChange(v: Int) {
        _precision.value = v
        calculate()
    }

    fun swapUnits() {
        val temp = _fromUnit.value
        _fromUnit.value = _toUnit.value
        _toUnit.value = temp
        calculate()
    }

    fun reset() {
        _input.value = ""
        _result.value = ""
    }

    private fun calculate() {
        val n = _input.value.toDoubleOrNull() ?: return
        val base = n * (unitMap[_fromUnit.value] ?: 1.0)
        val out = base / (unitMap[_toUnit.value] ?: 1.0)
        val f = Math.pow(10.0, _precision.value.toDouble())
        _result.value = (round(out * f) / f).toString()
    }
}
