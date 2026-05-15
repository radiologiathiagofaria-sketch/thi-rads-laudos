Add-Type -AssemblyName System.Windows.Forms
$rtf = New-Object System.Windows.Forms.RichTextBox
$rtf.LoadFile('c:\Users\thiag\OneDrive\Área de Trabalho\laudos padrão\US OBSTETRICO PADRÃO.rtf')
Write-Output $rtf.Text
