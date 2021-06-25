const savedMedicationFiles = chain (parallel (1))
                                   (S.ap (S.map (S.map) (S.map (copyFile (S3_ASSETS_SOURCE)) (eitherToFluture (S3_ASSETS_TARGET)))) (medicationFilesToCloneFluture))
                                   ;
