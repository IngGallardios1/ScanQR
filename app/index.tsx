import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, FlatList, TouchableOpacity } from 'react-native';

import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

import { connectdb, Database } from '../src/database';

import { ScannedCode } from '../src/models';


export default () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedCodes, setScannedCodes] = useState<ScannedCode[]>([]);
    const [db, setDb] = useState<Database>();

    const onBarcodeScanned = async function (result: BarcodeScanningResult) {
        if (window) {
            window.alert(result.data);
        } else {
            Alert.alert(result.data);
        }

        // Agregar nuevo código escaneado
        const db = await connectdb();
        await db.insertarCodigo(result.data, result.type);

        setScannedCodes(await db.consultarCodigos());

    };

    useEffect(() => {
        let isMounted = true;

        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (!isMounted) return;

            if (status !== 'granted') {
                if (isMounted) setErrorMsg('Permiso a la ubicación denegado');
                return;
            }

            let loc = await Location.getCurrentPositionAsync();
            if (isMounted) setLocation(loc);
        }


        async function connect2Db() {
          //setDb(await connectdb());
            //const db = await connectdb();
            //setScannedCodes(await db.consultarCodigos());
        }

        getCurrentLocation();
        connect2Db();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect( () => {
      if (!db) return;

      db.consultarCodigos().then((codigos) => setScannedCodes(codigos));

      return () => {
        db?.close();
      }
    }, [db]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View>
                <Text>Sin acceso a la cámara</Text>
                <Button title="Solicitar permiso" onPress={requestPermission} />
            </View>
        );
    }

    let text = 'Cargando...';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    const ScannedItem = function ({ item }: { item: ScannedCode }) {
        const onCopyPressed = function () {
            Clipboard.setStringAsync(item.data);
        };
        return (
            <View>
                <Text>{item.data}</Text>
                <TouchableOpacity onPress={onCopyPressed}>
                    <Text>Copiar</Text>
                </TouchableOpacity>
                { /*item.location && (
                    <>
                        <Text>{item.location.timestamp}</Text>
                        <Text>Lat: {item.location.coords.latitude}, Long: {item.location.coords.longitude}</Text>
                    </>
                )*/}
            </View>
        );
    };

    return (
        <View>
            <Text>GPS: {text}</Text>
            <CameraView
                style={styles.cameraView}
                facing={facing}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'code128', 'datamatrix', 'aztec', 'ean13'],
                }}
                onBarcodeScanned={onBarcodeScanned}
            />
            <FlatList
                data={scannedCodes}
                keyExtractor={(item) => item.id ?? Math.random().toString()}
                renderItem={ScannedItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    cameraView: {
        width: '100%',
        minHeight: 660,
        height: '100%',
    },
}); 